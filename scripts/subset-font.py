"""Rebuild the public UI font with FontTools and Brotli. The site build uses the saved WOFF2."""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


root = Path(__file__).resolve().parent.parent
assets = root / "src" / "assets" / "fonts"
characters = set(range(0x20, 0x7F))
for path in (root / "src").rglob("*"):
    if path.suffix in {".mjs", ".js", ".css"}:
        characters.update(map(ord, path.read_text(encoding="utf-8")))
characters.update(map(ord, (root / "scripts" / "build.mjs").read_text(encoding="utf-8")))

font = TTFont(assets / "PretendardVariable.woff2", recalcTimestamp=False)
used = characters.intersection(font.getBestCmap())
weight, = font["fvar"].axes
weight_range = (weight.axisTag, weight.minValue, weight.defaultValue, weight.maxValue)
options = subset.Options()
options.name_IDs = ["*"]
options.name_languages = ["*"]
options.layout_features = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=used)
subsetter.subset(font)

# Keep the copyright and OFL notices, and give the derivative its own family and instance names.
for record in font["name"].names:
    if record.nameID in {1, 3, 4, 6, 16, 18, 21, 25} or record.nameID >= 256:
        text = record.toUnicode()
        for original, replacement in (
            ("Pretendard Variable", "Hanjibung Site Text"),
            ("PretendardVariable", "HanjibungSiteText"),
            ("Pretendard", "Hanjibung Site Text"),
            ("프리텐다드", "한지붕 본문"),
        ):
            text = text.replace(original, replacement)
        record.string = text

output = assets / "HanjibungSiteText.woff2"
font.save(output)
with TTFont(output) as saved:
    assert used <= saved.getBestCmap().keys()
    assert saved["name"].getBestFamilyName() == "Hanjibung Site Text"
    weight, = saved["fvar"].axes
    assert (weight.axisTag, weight.minValue, weight.defaultValue, weight.maxValue) == weight_range
print(f"{output.name}: {len(used)} characters, {output.stat().st_size:,} bytes")
