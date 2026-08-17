import re

from app.models.features import WorkloadFeatures


def _count_sentences(text: str) -> int:
    sentences = re.split(r"[.!?]+", text)
    return len([s for s in sentences if s.strip()])


def _count_questions(text: str) -> int:
    return text.count("?")


def _count_instructions(text: str) -> int:
    instruction_patterns = [
        r"\bfind\b",
        r"\bcompare\b",
        r"\banalyze\b",
        r"\bexplain\b",
        r"\bsummarize\b",
        r"\bverify\b",
        r"\bcheck\b",
        r"\bidentify\b",
        r"\bcalculate\b",
        r"\bcreate\b",
        r"\bgenerate\b",
        r"\bprovide\b",
    ]

    return sum(
        len(re.findall(pattern, text, flags=re.IGNORECASE))
        for pattern in instruction_patterns
    )


def _count_enumerations(text: str) -> int:
    numbered_items = re.findall(r"(?:^|\n)\s*\d+[.)]\s+", text)
    bullet_items = re.findall(r"(?:^|\n)\s*[-*]\s+", text)

    return len(numbered_items) + len(bullet_items)


def _signal_score(text: str, patterns: list[str]) -> int:
    matches = 0

    for pattern in patterns:
        if re.search(pattern, text, flags=re.IGNORECASE):
            matches += 1

    return min(matches, 3)


def extract_features(prompt: str) -> WorkloadFeatures:
    normalized_prompt = prompt.strip()

    research_patterns = [
        r"\bresearch\b",
        r"\binvestigate\b",
        r"\bdeep dive\b",
        r"\bfind information\b",
        r"\blook into\b",
    ]

    retrieval_patterns = [
        r"\bsearch\b",
        r"\bretrieve\b",
        r"\blook up\b",
        r"\bconsult\b.*\bdocuments?\b",
        r"\buse\b.*\bsources?\b",
        r"\bknowledge base\b",
    ]

    comparison_patterns = [
        r"\bcompare\b",
        r"\bcontrast\b",
        r"\bdifference\b",
        r"\bversus\b",
        r"\bpros and cons\b",
    ]

    tool_patterns = [
        r"\buse\b.*\btool\b",
        r"\bexecute\b",
        r"\brun\b.*\bcode\b",
        r"\bbrowse\b",
        r"\bcall\b.*\bapi\b",
        r"\baccess\b.*\bwebsite\b",
    ]

    iteration_patterns = [
        r"\bkeep\b.*\bsearching\b",
        r"\btry again\b",
        r"\buntil\b",
        r"\biterate\b",
        r"\brepeat\b",
        r"\brefine\b",
        r"\bif necessary\b",
    ]

    generation_patterns = [
        r"\bwrite\b",
        r"\bgenerate\b",
        r"\bcreate\b",
        r"\bproduce\b",
        r"\bdraft\b",
        r"\bcompose\b",
    ]

    return WorkloadFeatures(
        prompt_length=len(normalized_prompt),
        sentence_count=_count_sentences(normalized_prompt),
        question_count=_count_questions(normalized_prompt),
        instruction_count=_count_instructions(normalized_prompt),
        enumeration_count=_count_enumerations(normalized_prompt),
        research_signal=_signal_score(
            normalized_prompt, research_patterns
        ),
        retrieval_signal=_signal_score(
            normalized_prompt, retrieval_patterns
        ),
        comparison_signal=_signal_score(
            normalized_prompt, comparison_patterns
        ),
        tool_signal=_signal_score(
            normalized_prompt, tool_patterns
        ),
        iteration_signal=_signal_score(
            normalized_prompt, iteration_patterns
        ),
        generation_signal=_signal_score(
            normalized_prompt, generation_patterns
        ),
    )