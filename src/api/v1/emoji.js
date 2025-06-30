import emojis from '../../data/emojis';

export default function handler(req, res) {
  const { emoji } = req.query;

  if (emoji) {
    // Find specific emoji
    const found = emojis.find(e => e.emoji === emoji);
    if (!found) {
      return res.status(404).json({ error: "Emoji not found." });
    }
    return res.json({
      ...found,
      info: {
        credits: "Made by harys722, available only for cool people.",
        website: "https://harys.is-a.dev"
      }
    });
  } else {
    // No param: pick a random emoji from the list
    const randomIndex = Math.floor(Math.random() * emojis.length);
    const randomEmoji = emojis[randomIndex];
    return res.json({
      ...randomEmoji,
      info: {
        credits: "Made by harys722, available only for cool people.",
        website: "https://harys.is-a.dev"
      }
    });
  }
}
