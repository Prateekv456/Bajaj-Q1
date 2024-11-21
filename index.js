const express = require('express');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type'); // Correct import for file-type
const atob = require('atob');

const app = express();

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Function to check if a number is prime
function is_prime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

// Function to process the request and generate response
async function processRequest(request) {
    const data = request.data;
    const file_b64 = request.file_b64;

    const numbers = [];
    const alphabets = [];
    const lowercase_alphabets = [];
    let highest_lowercase_alphabet = null;
    let is_prime_found = false;

    // Process the data
    data.forEach(item => {
        if (item.match(/^\d+$/)) {
            numbers.push(item);
            if (is_prime(parseInt(item))) {
                is_prime_found = true;
            }
        } else if (item.match(/^[a-zA-Z]+$/)) {
            alphabets.push(item);
            if (item === item.toLowerCase()) {
                lowercase_alphabets.push(item);
            }
        }
    });

    // Find the highest lowercase alphabet character
    if (lowercase_alphabets.length > 0) {
        highest_lowercase_alphabet = lowercase_alphabets.sort((a, b) => b.charCodeAt(0) - a.charCodeAt(0))[0];
    }

    // Decode and validate the file
    let file_valid = false;
    let file_mime_type = null;
    let file_size_kb = null;

    if (file_b64) {
        const file_data = Buffer.from(file_b64, 'base64');
        
        // Use the correct method from file-type to detect mime type
        const result = await fileType.fromBuffer(file_data);  // Use fromBuffer() method
        file_mime_type = result ? result.mime : null;
        file_size_kb = Math.round(file_data.length / 1024);

        // Check if the file is a valid PDF (or other types if necessary)
        if (file_mime_type && file_mime_type === 'application/pdf') {
            file_valid = true;
        } else if (file_mime_type && file_mime_type.startsWith('image/')) {
            // Allow image files (e.g., jpeg, png)
            file_valid = true;
        }
    }

    // Prepare the response in the desired format
    return {
        "is_success": true,
        "user_id": "john_doe_17091999",
        "email": "john@xyz.com",
        "roll_number": "ABCD123",
        "numbers": numbers,
        "alphabets": alphabets,
        "highest_lowercase_alphabet": highest_lowercase_alphabet,
        "is_prime_found": is_prime_found,
        "file_valid": file_valid,
        "file_mime_type": file_mime_type || "doc/pdf", // Default to doc/pdf if no valid mime type found
        "file_size_kb": file_size_kb ? file_size_kb.toString() : "0"
    };
}


// API endpoint to process the request
app.post('/api/process', async (req, res) => {
    const input = req.body;

    if (!input || !input.data || !input.file_b64) {
        return res.status(400).json({ error: "Invalid request data" });
    }

    try {
        const response = await processRequest(input); // Use await for async function
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Serve the index.js file content when a GET request is made
app.get('/get-code', (req, res) => {
    const filePath = path.join(__dirname, 'index.js');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Could not read file" });
        }
        res.setHeader('Content-Type', 'application/javascript');
        res.send(data);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
