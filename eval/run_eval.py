"""
Lightweight evaluation harness for the RAG pipeline.

Why this exists instead of RAGAS: RAGAS was tried first (it's the tool
most 2026 guides point to), but its current release has a broken import
chain in a clean environment (langchain_community.chat_models.vertexai
is missing from the package it depends on). Rather than fight a third
party dependency for a project that needs to just work, this is a small,
fully-owned harness that measures the two things that actually matter:

  1. Retrieval accuracy: for each handwritten question, does the
     retriever pull back a chunk from the file we expect the answer to
     live in? (retrieval recall)
  2. Answer faithfulness (proxy): if a live LLM key is configured, does
     the generated answer actually contain the expected keywords, rather
     than a vague or hallucinated non-answer?

Run modes:
  python eval/run_eval.py                 -> retrieval-only (no API key needed)
  python eval/run_eval.py --with-generation -> also scores generated answers
                                                (needs at least one provider key)

This intentionally trades sophistication for something you can read start
to finish in five minutes and explain confidently in an interview.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import rag
from app.llm import generate, NoProviderAvailable

EVAL_SET_PATH = Path(__file__).parent / "eval_set.json"


def load_eval_set():
    return json.loads(EVAL_SET_PATH.read_text(encoding="utf-8"))


def score_retrieval(cases):
    rag.ingest(force=True)
    results = []
    hits = 0
    for case in cases:
        chunks = rag.retrieve(case["question"])
        sources_hit = {c["source"] for c in chunks}
        correct = case["expected_source"] in sources_hit
        hits += int(correct)
        results.append(
            {
                "question": case["question"],
                "expected_source": case["expected_source"],
                "retrieved_sources": sorted(sources_hit),
                "correct": correct,
            }
        )
    recall = hits / len(cases) if cases else 0.0
    return recall, results


def score_generation(cases):
    results = []
    hits = 0
    for case in cases:
        chunks = rag.retrieve(case["question"])
        try:
            answer, provider = generate(case["question"], chunks)
        except NoProviderAvailable as e:
            return None, [{"error": str(e)}]

        answer_lower = answer.lower()
        keyword_hits = [kw for kw in case["expected_keywords"] if kw.lower() in answer_lower]
        faithful = len(keyword_hits) >= 1
        hits += int(faithful)
        results.append(
            {
                "question": case["question"],
                "answer": answer,
                "provider": provider,
                "expected_keywords": case["expected_keywords"],
                "matched_keywords": keyword_hits,
                "faithful": faithful,
            }
        )
    faithfulness = hits / len(cases) if cases else 0.0
    return faithfulness, results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--with-generation", action="store_true")
    args = parser.parse_args()

    cases = load_eval_set()

    print(f"Running retrieval eval on {len(cases)} handwritten questions...\n")
    recall, retrieval_results = score_retrieval(cases)
    for r in retrieval_results:
        mark = "PASS" if r["correct"] else "FAIL"
        print(f"[{mark}] {r['question']}")
        print(f"       expected: {r['expected_source']}  retrieved: {r['retrieved_sources']}")
    print(f"\nRetrieval recall@{rag.TOP_K if hasattr(rag, 'TOP_K') else 4}: {recall:.0%} ({sum(r['correct'] for r in retrieval_results)}/{len(cases)})\n")

    if args.with_generation:
        print("Running generation eval (calls a live LLM provider)...\n")
        faithfulness, gen_results = score_generation(cases)
        if faithfulness is None:
            print(gen_results[0]["error"])
            print("\nSkipping generation scoring - configure an API key in .env and re-run with --with-generation.")
            return
        for r in gen_results:
            mark = "PASS" if r["faithful"] else "FAIL"
            print(f"[{mark}] ({r['provider']}) {r['question']}")
            print(f"       answer: {r['answer']}")
        print(f"\nAnswer faithfulness (keyword proxy): {faithfulness:.0%}\n")
    else:
        print("Skipped generation scoring (no --with-generation flag). Retrieval works with zero API keys.")


if __name__ == "__main__":
    main()
