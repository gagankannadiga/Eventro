## Eventro: AI-Powered Event Management Platform

Eventro is a comprehensive event management platform that simplifies event planning by connecting users with professional event organizers and integrating a powerful AI assistant. The platform uses a full-stack architecture to provide features like organizer booking, AI-powered outfit suggestions, image generation, event planning assistance, and automated document creation.

-----

### Key Features

  * **Organizer Booking**: A straightforward form for users to book event organizers for various occasions, like weddings, birthdays, and corporate events.
  * **AI Chat Assistant**: A versatile assistant that uses OpenAI's GPT-4o and DALL·E 3 APIs to provide:
      * **Outfit Analysis & Suggestions**: Recommends personalized outfit ideas based on an uploaded image and personality analysis.
      * **Image Generation**: Creates custom visual content for events and outfits from text prompts.
      * **Event Planning & Summarization**: Offers intelligent planning guidance and generates organized documents of event plans or chat summaries in `.docx` format.
  * **Dynamic and Static Content**: The platform uses Node.js and Express.js to handle form submissions and AI responses, while serving static HTML, CSS, and JavaScript files for a responsive user interface.

-----

### Technologies Used

  * **Frontend**: HTML, CSS, JavaScript
  * **Backend**: Node.js, Express.js
  * **AI Integration**: OpenAI API (GPT-4o, DALL·E 3)
  * **File Handling**: `multer`, Node.js `fs` module
  * **Document Generation**: `docx`
  * **Environment Variables**: `dotenv`

-----

### Getting Started

To run Eventro locally, follow these steps:

1.  **Prerequisites**: Ensure **Node.js** is installed on your system.
2.  **Installation**:
      * Install necessary dependencies using `npm`:
        ```bash
        npm install express multer openai docx dotenv
        ```
      * Create a `.env` file in the project's root directory and add your OpenAI API Key:
        ```env
        OPENAI_API_KEY=your_openai_api_key_here
        ```
      * Create the required directories: `public/`, `uploads/`, and `public/downloads/`.
3.  **Running the Application**:
      * Start the server by running `node server.js` in your terminal.
      * Access the application by navigating to `http://localhost:3000` in your web browser.

-----

### Contributing

Contributions are welcome\! If you have suggestions for improvements or new features, feel free to fork the repository and submit a pull request.
