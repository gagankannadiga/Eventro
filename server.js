const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { OpenAI } = require('openai');
const { Document, Packer, Paragraph, TextRun } = require('docx');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensures downloads directory exists
const downloadDir = path.join(__dirname, 'public', 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Serve static HTML pages
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/confirmation.html', (_, res) => res.sendFile(path.join(__dirname, 'public/confirmation.html')));
app.get('/booking-success.html', (_, res) => res.sendFile(path.join(__dirname, 'public/booking-success.html')));
app.get('/chat.html', (_, res) => res.sendFile(path.join(__dirname, 'public/chat.html')));

// Contact form handler
app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required.' });

  const entry = { name, email, message };
  const filePath = path.join(__dirname, 'customer.json');
  let existing = [];

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      existing = data ? JSON.parse(data) : [];
    }
    existing.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (err) {
    console.error('Write error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Booking form handler
app.post('/submit-booking', (req, res) => {
  const { fullName, email, phone, whatsapp, requirements } = req.body;
  if (!fullName || !email || !phone || !whatsapp) return res.status(400).send('All fields required.');

  const entry = {
    fullName,
    email,
    phone,
    whatsapp,
    requirements: requirements || '',
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'confirmation.json');
  let data = [];

  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      data = fileData ? JSON.parse(fileData) : [];
    }
    data.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const name = encodeURIComponent(fullName.replace(/[^a-zA-Z0-9 .'-]/g, ''));
    res.redirect(`/booking-success.html?name=${name}`);
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).send('Something went wrong.');
  }
});

// Chat + Image + DOCX Generator
app.post('/chat', upload.single('image'), async (req, res) => {
  const userMessage = req.body.message || '';
  const imagePath = req.file ? path.resolve(req.file.path) : null;

  try {
    let image_url = null;
    let docx_url = null;
    let dallePrompt = null;

    const systemPrompt = {
      role: 'system',
      content: "You are EventroBot, a friendly fashion stylist and event planning assistant. If an image is uploaded, analyze the person’s visible appearance and suggest appropriate formal or party outfits."
    };

    let messages = [systemPrompt];

    if (imagePath) {
      const base64Image = fs.readFileSync(imagePath).toString('base64');

      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${userMessage}\n\nThe attached image is of a person. Please analyze their appearance and recommend formal and party outfits. Also suggest a suitable DALL·E prompt to generate a visual outfit image for them.`
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          }
        ]
      });
    } else {
      messages.push({ role: 'user', content: userMessage });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages
    });

    const text = response.choices[0].message.content.trim();

    if (imagePath && /generate.*outfit.*image/i.test(userMessage.toLowerCase())) {
      const match = text.match(/(Generate.*outfit.*?)[.!\n]/i);
      if (match) {
        dallePrompt = match[1];
      }
    }

    // DOCX generation
    if (/document|plan|report|summary/i.test(userMessage.toLowerCase())) {
      const paragraphs = text.split('\n').filter(line => line.trim()).map(line =>
        new Paragraph({ children: [new TextRun({ text: line, break: 1 })] })
      );

      const doc = new Document({
        creator: "EventroBot",
        title: "Event Planning Document",
        description: "Generated by Eventro AI Assistant",
        sections: [{ properties: {}, children: paragraphs }],
      });

      const buffer = await Packer.toBuffer(doc);
      const fileName = `document-${Date.now()}.docx`;
      const filePath = path.join(downloadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      docx_url = `/downloads/${fileName}`;
    }

    // DALL·E Image generation
    if (/generate.*image/i.test(userMessage.toLowerCase()) || dallePrompt) {
      const dalle = await openai.images.generate({
        model: 'dall-e-3',
        prompt: dallePrompt || userMessage,
        n: 1,
        size: '1024x1024'
      });
      image_url = dalle.data[0].url;
    }

    res.json({ text, image_url, docx_url });

  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ text: "⚠️ Sorry, something went wrong." });
  } finally {
    if (imagePath) fs.unlink(imagePath, () => {});
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
