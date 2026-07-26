#!/usr/bin/env python3
"""Update and verify Helm image values without requiring PyYAML."""

from __future__ import annotations

import argparse
from pathlib import Path


def read_image(path: Path) -> dict[str, str]:
    values = {"repository": "", "tag": "", "digest": ""}
    in_image = False
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if stripped == "image:":
            in_image = True
            continue
        if in_image and line and not line.startswith(" "):
            break
        if in_image:
            for key in values:
                if stripped.startswith(f"{key}:"):
                    values[key] = stripped.split(":", 1)[1].strip().strip('"')
    return values


def set_image(path: Path, repository: str, tag: str, digest: str) -> None:
    if not repository or not tag or not digest:
        raise SystemExit("repository, tag, and digest are required")

    lines = path.read_text().splitlines()
    in_image = False
    saw_repository = False
    saw_tag = False
    saw_digest = False
    insert_after = None

    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped == "image:":
            in_image = True
            continue
        if in_image and line and not line.startswith(" "):
            if not saw_digest and insert_after is not None:
                lines.insert(insert_after + 1, f'  digest: "{digest}"')
            in_image = False
        if not in_image:
            continue
        if stripped.startswith("repository:"):
            lines[index] = f'  repository: "{repository}"'
            saw_repository = True
            insert_after = index
        elif stripped.startswith("tag:"):
            lines[index] = f'  tag: "{tag}"'
            saw_tag = True
            insert_after = index
        elif stripped.startswith("digest:"):
            lines[index] = f'  digest: "{digest}"'
            saw_digest = True
            insert_after = index

    if in_image and not saw_digest and insert_after is not None:
        lines.insert(insert_after + 1, f'  digest: "{digest}"')

    missing = [
        name
        for name, seen in {
            "repository": saw_repository,
            "tag": saw_tag,
        }.items()
        if not seen
    ]
    if missing:
        raise SystemExit(f"Missing image keys in {path}: {', '.join(missing)}")

    path.write_text("\n".join(lines) + "\n")


def verify_image(path: Path, repository: str, tag: str, digest: str) -> None:
    actual = read_image(path)
    expected = {"repository": repository, "tag": tag, "digest": digest}
    mismatches = [
        f"{key}: expected {expected[key]!r}, got {actual[key]!r}"
        for key in expected
        if actual[key] != expected[key]
    ]
    if mismatches:
        raise SystemExit(f"Image values verification failed for {path}: " + "; ".join(mismatches))


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    set_parser = subparsers.add_parser("set")
    set_parser.add_argument("--file", type=Path, required=True)
    set_parser.add_argument("--repository", required=True)
    set_parser.add_argument("--tag", required=True)
    set_parser.add_argument("--digest", required=True)

    promote_parser = subparsers.add_parser("promote")
    promote_parser.add_argument("--source", type=Path, required=True)
    promote_parser.add_argument("--destination", type=Path, required=True)
    promote_parser.add_argument("--repository")
    promote_parser.add_argument("--tag")
    promote_parser.add_argument("--digest")

    verify_parser = subparsers.add_parser("verify")
    verify_parser.add_argument("--file", type=Path, required=True)
    verify_parser.add_argument("--repository", required=True)
    verify_parser.add_argument("--tag", required=True)
    verify_parser.add_argument("--digest", required=True)

    args = parser.parse_args()

    if args.command == "set":
        set_image(args.file, args.repository, args.tag, args.digest)
        verify_image(args.file, args.repository, args.tag, args.digest)
    elif args.command == "promote":
        source = read_image(args.source)
        repository = args.repository or source["repository"]
        tag = args.tag or source["tag"]
        digest = args.digest or source["digest"]
        set_image(args.destination, repository, tag, digest)
        verify_image(args.destination, repository, tag, digest)
    elif args.command == "verify":
        verify_image(args.file, args.repository, args.tag, args.digest)


if __name__ == "__main__":
    main()


#testing
