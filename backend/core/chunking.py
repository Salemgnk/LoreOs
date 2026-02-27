"""Découpage de texte en chunks pour l'indexation vectorielle."""

from config import get_settings


def chunk_text(text: str, source_label: str = "") -> list[dict]:
    """
    Découpe un texte en chunks avec overlap.
    Retourne une liste de {"content": str, "source": str, "index": int}.
    """
    s = get_settings()
    size = s.chunk_size
    overlap = s.chunk_overlap

    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + size
        chunk_words = words[start:end]
        chunks.append(
            {
                "content": " ".join(chunk_words),
                "source": source_label,
                "index": len(chunks),
            }
        )
        start += size - overlap

    return chunks
