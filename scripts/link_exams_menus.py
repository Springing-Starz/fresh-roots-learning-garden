#!/usr/bin/env python3
"""Point each class hub's EXAMINATIONS menu at its own exam documents page.

Classes whose exam files exist in the Fresh-Teacher/exams repository get a menu
that opens the catalog page for that class; classes without files are left
exactly as they are so their current links keep working.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HUBS = ROOT / "src" / "data" / "class-hubs"

# Hub file stem -> (class key, repository folder holding the class ZIP)
CLASSES = {
    "baby.html": ("baby", "Baby"),
    "middle.html": ("middle", "Middle"),
    "top.html": ("top", "Top"),
    "p1.html": ("p1", "P1"),
    "p2.html": ("p2", "P2"),
    "p3.html": ("p3", "P3"),
    "p4.html": ("p4", "P4"),
    "p5.html": ("p5", "P5"),
    "p6.html": ("p6", "P6"),
    "p.6.html": ("p6", "P6"),
}


def compact(payload: object) -> str:
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def main() -> int:
    changed = 0
    for stem, (key, folder) in CLASSES.items():
        path = HUBS / f"{stem}.json"
        if not path.is_file():
            print(f"skip (no hub file): {stem}")
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        menu = next((item for item in data["menus"] if item.get("label") == "EXAMINATIONS"), None)
        if menu is None:
            print(f"skip (no EXAMINATIONS menu): {stem}")
            continue
        # A direct button: no dropdown, it opens the class exam documents page.
        menu["href"] = f"/more/exams-{key}"
        menu["items"] = []
        path.write_text(compact(data) + "\n", encoding="utf-8")
        changed += 1
        print(f"{stem}: EXAMINATIONS -> /more/exams-{key}")
    print(f"updated {changed} class hubs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
