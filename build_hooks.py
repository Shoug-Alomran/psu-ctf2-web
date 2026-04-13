from __future__ import annotations

from pathlib import Path
import json


def on_post_build(config, **kwargs):
    site_dir = Path(config["site_dir"])
    target_dir = site_dir / ".well-known" / "appspecific"
    target_dir.mkdir(parents=True, exist_ok=True)

    payload = {
        "name": "ACM CTF 2.0",
        "description": "Chrome DevTools probe response for local MkDocs development.",
    }

    (target_dir / "com.chrome.devtools.json").write_text(
        json.dumps(payload, indent=2) + "\n",
        encoding="utf-8",
    )
