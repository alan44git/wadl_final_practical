const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// 1. Database Connection (Task a)
mongoose.connect('mongodb://127.0.0.1:27017/music')
    .then(() => console.log("Connected to MongoDB: music database"))
    .catch(err => console.error("Connection error", err));

// 2. Define Schema and Model (Task b)
const songSchema = new mongoose.Schema({
    Songname: String,
    Film: String,
    Music_director: String,
    singer: String,
    Actor: String,   // Added for Task j
    Actress: String  // Added for Task j
});

const Song = mongoose.model('songdetails', songSchema);

// Helper function to seed initial data (Task c)
const seedData = async () => {
    const count = await Song.countDocuments();
    if (count === 0) {
        const initialSongs = [
            { Songname: 'Song One', Film: 'Film A', Music_director: 'Director X', singer: 'Singer Y' },
            { Songname: 'Song Two', Film: 'Film B', Music_director: 'Director X', singer: 'Singer Z' },
            { Songname: 'Song Three', Film: 'Film A', Music_director: 'Director Y', singer: 'Singer Y' },
            { Songname: 'Song Four', Film: 'Film C', Music_director: 'Director Z', singer: 'Singer W' },
            { Songname: 'Song Five', Film: 'Film B', Music_director: 'Director X', singer: 'Singer Y' }
        ];
        await Song.insertMany(initialSongs);
        console.log("Initial 5 songs inserted.");
    }
};
seedData();

// --- Routes ---

// Task d & k: Display total count and list all documents in tabular format
app.get('/display-all', async (req, res) => {
    try {
        const songs = await Song.find();
        const count = await Song.countDocuments();

        let html = `<h3>Total Count: ${count}</h3><table border="1">
                    <tr><th>Song</th><th>Film</th><th>Director</th><th>Singer</th><th>Actor</th><th>Actress</th></tr>`;

        songs.forEach(s => {
            html += `<tr><td>${s.Songname}</td><td>${s.Film}</td><td>${s.Music_director}</td>
                     <td>${s.singer}</td><td>${s.Actor || '-'}</td><td>${s.Actress || '-'}</td></tr>`;
        });
        html += `</table>`;
        res.send(html);
    } catch (err) { res.status(500).send(err.message); }
});

// Task e: List specified Music Director songs (Example: Director X)
app.get('/director/:name', async (req, res) => {
    const songs = await Song.find({ Music_director: req.params.name });
    res.json(songs);
});

// Task f: List specified Music Director songs sung by specified Singer
app.get('/filter/:director/:singer', async (req, res) => {
    const songs = await Song.find({ Music_director: req.params.director, singer: req.params.singer });
    res.json(songs);
});

// Task g: Delete a song (Example: Song One)
app.get('/delete-song/:name', async (req, res) => {
    await Song.deleteOne({ Songname: req.params.name });
    res.send(`Deleted ${req.params.name}`);
});

// Task h: Add new song
app.get('/add-favourite', async (req, res) => {
    const fav = new Song({ Songname: 'My Fav', Film: 'Great Film', Music_director: 'Maestro', singer: 'Legend' });
    await fav.save();
    res.send("Favourite song added!");
});

// Task i: List Songs by Singer from specified film
app.get('/search/:singer/:film', async (req, res) => {
    const songs = await Song.find({ singer: req.params.singer, Film: req.params.film });
    res.json(songs);
});

// Task j: Update document by adding Actor and Actress name
app.get('/update-cast/:songname/:actor/:actress', async (req, res) => {
    await Song.updateOne(
        { Songname: req.params.songname },
        { $set: { Actor: req.params.actor, Actress: req.params.actress } }
    );
    res.send(`Updated cast for ${req.params.songname} with Actor: ${req.params.actor} and Actress: ${req.params.actress}`);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/display-all`);
});