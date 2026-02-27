"""Pipeline RAG — recherche vectorielle + génération augmentée."""

from database import get_supabase
from core.embeddings import embed_query
from core.llm import generate_stream


def search_similar_chunks(
    universe_id: str,
    query: str,
    top_k: int = 5,
    threshold: float = 0.7,
) -> list[dict]:
    """Recherche les chunks les plus proches de la query dans pgvector."""
    db = get_supabase()
    query_embedding = embed_query(query)

    result = db.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "match_universe_id": universe_id,
            "match_count": top_k,
            "match_threshold": threshold,
        },
    ).execute()

    return result.data or []


SYSTEM_PROMPT = """Tu es LoreChat, l'assistant IA de LoreOS.
Tu réponds aux questions de l'utilisateur sur son univers fictif en te basant
UNIQUEMENT sur les données fournies ci-dessous.
Si l'information n'est pas dans les données, dis-le clairement.
Cite tes sources quand c'est pertinent (nom du personnage, lieu, événement...).
Réponds en français."""


async def rag_stream(universe_id: str, question: str):
    """Pipeline complet : recherche → contexte → génération streaming."""
    chunks = search_similar_chunks(universe_id, question)

    if not chunks:
        yield "Je n'ai pas trouvé d'information pertinente dans ton univers pour répondre à cette question."
        return

    # Construire le contexte
    context_parts = []
    for c in chunks:
        source = c.get("source_label", "")
        content = c.get("content", "")
        context_parts.append(f"[{source}] {content}")

    context = "\n\n".join(context_parts)

    prompt = f"""Contexte de l'univers :
{context}

Question de l'utilisateur :
{question}"""

    async for token in generate_stream(prompt, system=SYSTEM_PROMPT):
        yield token
