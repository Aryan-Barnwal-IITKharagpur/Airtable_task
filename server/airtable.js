const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Airtable = require('airtable');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],       
    allowedHeaders: ['Content-Type'],
    credential: true
};

app.use(cors(corsOptions));


const Base_id = "app755IAlA5by0SIb";
const Api_key = "patcxIhodwFPaz8kB.ebb62ecc8edabb1276185f24c7d6f8170730119b45c6bec6ca4e66a1a7705fbc";
const Table = "Clients Active | 🔁 | Operational";
const placementTable = "Placements | 🔁 | Operational";
const base = new Airtable({ apiKey: Api_key }).base(Base_id);

// Middleware
app.use(express.json());

async function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        base(Table).select({
            filterByFormula: `{SAAS_EMAIL} = '${email}'`
        }).firstPage((err, records) => {
            if (err) {
                reject(err);
            } else if (records.length === 0) {
                resolve(null);
            } else {
                resolve(records[0]);
            }
        });
    });
}

// Function to list active placement IDs
async function listActivePlacementsId(user) {
    const placements = user.fields["🔄 Placements"];
    if (!placements) {
        return [];
    }

    return placements;
}

// Function to list active placements
async function listActivePlacements(user) {

    const placements = user.fields["🔄 Placements copy"];
    if (!placements) {
        return [];
    }

    resplacements = placements.split(" ");

    return resplacements;
}

// Function to get placement details
async function getPlacementDetails(placementId) {
    return new Promise((resolve, reject) => {
        base(placementTable).find(placementId, (err, record) => {
            if (err) {
                reject(err);
            } else {
                resolve(record);
            }
        });
    });
}

// API endpoint to fetch user and placement details
app.post('/fetch-details', async (req, res) => {

    const email = req.body.query;
    
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // List active placements
        const activePlacements = await listActivePlacementsId(user);

        if (activePlacements.length === 0) {
            return res.status(404).json({ error: "No active placements found" });
        }

        if (!Array.isArray(activePlacements)) {
            console.error("activePlacements is not an array:");
        }
        else{
            console.log("HERE");

            res.json({
                user: user.fields,
                activePlacements,
            });
        }
        

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/fetch-placement-details', async (req, res) => {

    const placementId = req.body.query;
    
    if (!placementId) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        
        const details = await getPlacementDetails(placementId);
        if (!details) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(details);
        const { fields } = details;

        res.json({
            // id: details.id,
            headline: fields['ℹ️ Headline'] != null? fields['ℹ️ Headline']:"N/A",
            contactName: fields["⚙️Contact Name"]?.[0] || "N/A",
            contactEmail: fields["⚙️Contact Email"]?.[0] || "N/A",
            jobDescription: fields["ℹ️ Job Description (For Softr)"] || "No description available",
        });
        

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log("HELLO");
});