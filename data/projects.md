# Projects

## Multi-Provider RAG Knowledge System (PookiDevs Technologies)

Aiman designed and deployed a Retrieval-Augmented Generation system in Python using ChromaDB as the vector store. The system integrated three LLM providers (GPT-4, Claude, and Gemini) with automatic fallback logic, so if one provider failed or was rate-limited, requests were automatically routed to the next available provider. This kept the system's AI responses reliable under variable load, which mattered because the platform served hundreds of schools. The system retrieved relevant context chunks before generation, producing grounded, context-aware answers instead of relying on the model's raw knowledge alone.

## Ask My Portfolio (RAG chatbot, self-built)

Aiman built a second RAG system, this time to make her own CV and portfolio queryable through natural-language chat. It ingests her background (experience, education, skills, projects) into a local ChromaDB vector store using free local embeddings, retrieves the most relevant chunks for a given question, and generates a grounded answer through the same multi-provider fallback pattern (OpenAI, Anthropic, Gemini) she built at PookiDevs. It ships with a small handwritten evaluation set that checks retrieval accuracy and answer faithfulness before any change is considered done, and is deployed behind a FastAPI service in a Docker container, embeddable as a chat widget on her portfolio site.

## MuJoCo Robot Simulation Visualizer (Audi Development Camp)

As Integration Lead on a team building a reinforcement-learning workflow for a simulated Unitree G1 humanoid robot (29 degrees of freedom), Aiman built a local GUI application to visualize live MuJoCo simulations. The tool tracked performance metrics and simulation outputs in real time, which the team used to support demos of the robot's learned behavior. She also owned the team's GitHub repository and branching strategy, reviewing and merging code across the team.

## Angular Component Library (PookiDevs Technologies)

Aiman developed a set of reusable Angular component libraries that standardized frontend development practices across multiple customer-facing projects, reducing delivery time for new features and keeping the UI consistent across the platform.
