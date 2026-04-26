const mongoose = require('mongoose');
require('dotenv').config();

const violationSchema = new mongoose.Schema({
    username: String,
    name: String,
    kelas: String,
    stage: String,
    type: String,
    details: String,
    timestamp: Date
});

async function clearViolations() {
    try {
        // Connect to MongoDB using the same connection string as the app
        // Since I don't have .env, I'll look at server.js for the URI
        const mongoURI = 'mongodb://localhost:27017/litra-ai'; // Default if not found
        
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB.');

        const Violation = mongoose.model('Violation', violationSchema);
        const result = await Violation.deleteMany({});
        
        console.log(`Successfully deleted ${result.deletedCount} violation records.`);
        process.exit(0);
    } catch (err) {
        console.error('Error clearing violations:', err);
        process.exit(1);
    }
}

clearViolations();
