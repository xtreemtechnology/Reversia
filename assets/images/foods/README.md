# Food photos for Reversia

Real photographs for the bold Home redesign and the Food Guide. Six of the
photos (hero plate, beans, vegetable soup, jollof, okra soup, grilled fish)
are Creative Commons photos found through Openverse (Flickr), free to use
with attribution. The cooking photo is Pexels (free licence) and the avocado
is a StockCake free stock photo. Three photos (moi moi, pawpaw, banana) still
come from food blogs, not a stock library — replace those three with a
properly licensed photo (Unsplash / Pexels / Openverse) or a photo Daniel
takes himself before the app ships with them, and keep the attribution below
up to date.

No image here is AI-generated and none is copied from the Paw Care reference.

| File | Shows | Food Guide rating | Source page | Licence |
|---|---|---|---|---|
| `hero-food-spread.jpg` (1024×768, 137 KB) | Pounded yam, vegetable soup and jollof rice on one plate | — (hero image) | Openverse / Flickr — "Pounded Yam, Vegetable Soup, Jollof Rice" | CC BY — free with attribution |
| `food-beans.jpg` (1000×667, 94 KB) | Bean stew — bowl of stewed beans (Cuban black beans) | Safe — Beans (Ewa) | Openverse / Flickr — "cuban black bean stew" | CC BY — free with attribution |
| `food-moi-moi.jpg` (1000×562, 93 KB) | Moi moi — steamed bean pudding, turned out of the mould | Safe — Moi Moi | https://www.bellanaija.com/2020/07/sisi-jemimah-vlog-8/ | Not confirmed free — preview use; replace before shipping |
| `food-vegetable-soup.jpg` (450×300, 22 KB) | Vegetable soup — bowl of green vegetable soup | Safe — Edikang Ikong / Afang (leafy vegetable soup) | Openverse / Flickr — "Vegetable soup" | CC BY-SA — free with attribution, share alike |
| `food-jollof-rice.jpg` (640×480, 39 KB) | Jollof rice | Caution — Jollof Rice | Openverse / Flickr — "Jollof Rice" | CC BY-SA — free with attribution, share alike |
| `food-okra-soup.jpg` (1000×662, 76 KB) | Okra stew — red snapper, kenkey and okra stew | Safe — Okra Soup | Openverse / Flickr — "Red snapper, Kenkey, okra stew" | CC BY — free with attribution |
| `food-grilled-fish.jpg` (1000×670, 122 KB) | Whole grilled fish with lemon and herbs | Not in the Food Guide — shown as a fresh pick, no rating | Openverse / Flickr — "Grilled Fish and Nam Prik Pla Tu" | CC BY-SA — free with attribution, share alike |
| `food-avocado.jpg` (512×512, 35 KB) | Avocado halves on a light green background | Not in the Food Guide — shown as a fresh pick, no rating | https://Stockcake.com/i/avocado-and-spoon_147703_19263 | StockCake free stock photo |
| `food-pawpaw.jpg` (1000×676, 61 KB) | Pawpaw (papaya), whole and sliced | Not in the Food Guide — shown as a fresh pick, no rating | https://storage.googleapis.com/dcirbafjnfqdie/what-are-benefits-of-eating-pawpaw.html (image: kokolevel.com) | Not confirmed free — preview use; replace before shipping |
| `food-banana.jpg` (1000×1000, 52 KB) | Bunch of ripe bananas on white | Caution — Banana | https://www.healthbenefitstimes.com/9/gallery/banana/Ripe-banana.jpg | Not confirmed free — preview use; replace before shipping |
| `cooking-fresh-food.jpg` (1200×800, 102 KB) | Woman preparing fresh vegetables in a bright kitchen | — (Today's Focus image) | https://www.pexels.com/ja-jp/photo/7315198/ | Pexels free licence |

## How the app uses them

Wired in since the Phase 2 rollout — `src/features/food-guide/foodPhotos.js`
maps guide food ids to these files with local `require()` calls, so nothing
is fetched at runtime:

| Food id | Photo | Shown in |
|---|---|---|
| `beans-ewa` (Beans, Safe) | `food-beans.jpg` | Food Guide card, Food Detail header, Home photo strip, Meal Detail thumb |
| `moi-moi` (Moi Moi, Safe) | `food-moi-moi.jpg` | Food Guide card, Food Detail header, Home photo strip, Meal Detail thumb |
| `edikang-ikong` (Edikang Ikong, Safe) | `food-vegetable-soup.jpg` | Food Guide card, Food Detail header, Home photo strip, Meal Detail thumb |
| `afang-soup` (Afang Soup, Safe) | `food-vegetable-soup.jpg` (same photo — one green leafy-soup photo stands for both soups) | Food Guide card, Food Detail header, Meal Detail thumb |
| `okra-soup` (Okra Soup, Safe) | `food-okra-soup.jpg` | Food Guide card, Food Detail header, Home photo strip, Meal Detail thumb |
| `jollof-rice` (Jollof Rice, Caution) | `food-jollof-rice.jpg` | Food Guide card, Food Detail header, Home photo strip, Meal Detail thumb |
| `banana` (Banana, Caution) | `food-banana.jpg` | Food Guide card, Food Detail header, Home photo strip, Meal Detail thumb |

Foods with no photo keep a clean photo-less card — nothing is faked. Garden
egg still has no photo. Grilled fish, avocado and pawpaw have photos here
but are not in the Food Guide, so they carry no rating and are not wired
into any screen yet. The redesign preview
(`~/workspace/reversia-redesign-preview/home-preview.html`) references the
same photos by their public source URLs so it renders anywhere.

## Notes

- The first vegetable-soup candidate (blog.fusion.ng) refused both HEAD and
  GET requests from this machine ("empty reply from server"), so the
  sportal365 / Pulse.ng image above was used instead.
- Garden egg has no photo: no good, honest photo of garden egg was found in
  the searches, so it was left out rather than substituting a wrong image.
- All files were downscaled with Pillow to a maximum width of 1000–1600 px
  and saved as JPEG quality 74–82, each at or under ~300 KB.
