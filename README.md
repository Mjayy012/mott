# Your Monthsary Website 💕

Everything you need to personalize is in **one place**: near the top of `index.html`,
inside the `<script>` tag, in the block labeled:

```
❤️  EASY CUSTOMIZATION — edit everything in this block  ❤️
```

Open `index.html` in any text editor (Notepad, TextEdit, VS Code, etc.) and change:

| What | Variable | Notes |
|---|---|---|
| Secret code | `MONTHSARY_CODE` | 6 digits, e.g. a meaningful date "MMDDYY" |
| Your names | `YOUR_NAME`, `PARTNER_NAME` | |
| Monthsary number | `MONTHSARY_NUMBER` | e.g. "6" |
| Anniversary date | `RELATIONSHIP_START_DATE` | format `YYYY-MM-DD`, powers the live counter |
| Music | `BACKGROUND_MUSIC` | path to an mp3 in the `music/` folder, or `""` to disable |
| Story timeline | `timelineEntries` | add/remove `{ date, title, desc, photo }` items freely |
| Photos | `photos` | add/remove `{ src, caption }` items — the slideshow adapts automatically |
| Videos | `videos` | add/remove `{ src, caption }` items — the player adapts automatically |
| Reasons I love you | `reasons` | a plain list of short lines |
| Love letter | `loveLetter` | use `\n` for line/paragraph breaks |
| Secret surprise message | `secretMessage` | shown after "There's One More Thing..." |

## Adding your media

1. Drop photos into `photos/` and reference them like `"photos/us-at-the-beach.jpg"`.
2. Drop videos into `videos/` and reference them like `"videos/our-trip.mp4"`.
3. Drop one song into `music/` and point `BACKGROUND_MUSIC` at it.

If a photo or video file is missing, that slide shows a gentle placeholder instead of
breaking — so it's safe to preview the site before all your media is ready.

## Viewing it

Just double-click `index.html` to open it in a browser. For the smoothest experience
(especially audio/video), you can also serve the folder locally, e.g.:

```
cd monthsary
python3 -m http.server 8000
```

then open `http://localhost:8000` on your phone or computer.

## Sharing it with your partner

Once it's ready, you can host the whole folder for free on a service like Netlify,
Vercel, or GitHub Pages, and send your partner the link. The password screen keeps
the surprise safe until they enter the code.

Happy monthsary! ❤️

## Chapter Seven reply

Chapter Seven fetches the shared envelope message from `replies.html`.

To show one message on all devices:

1. Open `replies.html`.
2. Put the message in the JSON block:

```json
{
  "message": "Your reply here"
}
```

3. Push the change to GitHub.

After GitHub Pages updates, every device that opens `story.html` will fetch that
same message and show it inside the Chapter Seven envelope.

The form on `story.html` still saves locally for quick testing, but GitHub Pages
cannot let a browser rewrite repo files automatically.
