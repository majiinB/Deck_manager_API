<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/deck-f429c.appspot.com/o/image_2024-10-25_214738368.png?alt=media&token=4efd82e3-b592-4335-8d96-72b330806330" alt="Header Cover" style="width: 100%; height: auto;">
</p>

---

# 🚪 Deck Manager API Service

## 🪟 Overview

The **Deck Manager API Service** is a hybrid API that primarily follows RESTful principles while incorporating RPC-style endpoints for searching and suggesting decks. It is one of the five core services in the _Deck_ app ecosystem and is responsible for managing deck-related functionalities. The API is built using Node.js, Express, and Firebase Functions, with authentication handled by Firebase Authentication.

---

## 🌟 Features

- CRUD operations for decks and flashcards
- Soft and hard deletion of decks and flashcards
- CORS protection with allowed origins
- Structured service and repository layers for scalability
- Search functionality for decks
- Personalized deck suggestions
- Personalized deck suggestions

---

## ⚙️ Techonolgies Used

- **🟢 Node.js & Express:** Backend framework for routing and handling requests
- **🔥 Firebase Functions:** Serverless backend hosting
- **#️⃣ TypeScript:\*** Strongly-typed JavaScript for better maintainability
- **🔥 Firestore (Firebase Database):** NoSQL database for storing decks and flashcards
- **🔥 Firebase Authentication:** User authentication and token verification
- **❌ CORS Middleware:** Cross-Origin Resource Sharing protection

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- Gemini API key
- Firebase admin SDK

### Installation

1. 🛠️ Clone this repository to your local machine.
2. 📦 Install dependencies using `npm install`.
3. ⚙️ Set up environment variables:
   - `GEMINI_API_KEY`: Your Google Generative AI API key.
   - `ASSISTANT_ID`: Your OpenAI assistant ID.
   - `FIREBASE_API_KEY`: Found in Firebase admin.
   - `AUTH_DOMAIN`: Found in Firebase admin.
   - `PROJECT_ID`: Found in Firebase admin.
   - `STORAGE_BUCKET`: Found in Firebase admin.
   - `MESSAGING_SENDER_ID`: Found in Firebase admin.
   - `APP_ID`: Found in Firebase admin.
   - `KEY_FILE`: Found in Firebase Service Providers.
4. 📃 generate your firebase private key json file and place it in your project's root folder
5. 🚀 Run the server using `npm start` or `nodemon`.

---

### 📡 API Endpoints

<DeckRoutes>
  <Route method="GET" endpoint="/decks/" description="Retrieve all decks owned by the user"/>
  <Route method="GET" endpoint="/decks/public" description="Retrieve all public decks"/>
  <Route method="GET" endpoint="/decks/:deckID" description="Retrieve a specific deck by ID"/>
  <Route method="GET" endpoint="/decks/search?q=&lt;query&gt;" description="Search decks by name or description"/>
  <Route method="GET" endpoint="/decks/suggestions" description="Get deck recommendations for a user"/>
  <Route method="POST" endpoint="/decks/" description="Create a new deck"/>
  <Route method="PUT" endpoint="/decks/:deckID" description="Update a specific deck"/>
  <Route method="DELETE" endpoint="/decks/:deckID" description="Hard delete a deck"/>
  <Route method="POST" endpoint="/decks/delete" description="Soft delete a deck"/>
</DeckRoutes>

<FlashcardRoutes>
  <Route method="GET" endpoint="/decks/:deckID/flashcards" description="Retrieve all flashcards in a deck"/>
  <Route method="GET" endpoint="/decks/:deckID/flashcards/random" description="Retrieve random flashcards from a deck"/>
  <Route method="GET" endpoint="/decks/:deckID/flashcards/:flashcardID" description="Retrieve a specific flashcard by ID"/>
  <Route method="POST" endpoint="/decks/:deckID/flashcards" description="Add a new flashcard to a deck"/>
  <Route method="PUT" endpoint="/decks/:deckID/flashcards/:flashcardID" description="Update a flashcard"/>
  <Route method="DELETE" endpoint="/decks/:deckID/flashcards/:flashcardID" description="Delete a flashcard"/>
</FlashcardRoutes>

#### 🛡️ Content Moderation

- **POST** `/v2/deck/moderate/:id`

  - **Description:** Uses Gemini AI to analyze user-generated content and determine its appropriateness.
  - **Path Parameter:**
    - `id` (string) – The user's unique ID.
  - **Request Body:**
    ```json
    {
      "deckId": "<unique_deck_id>"
    }
    ```
  - **Response:**

    ```json
    {
      "status": 200,
      "request_owner_id": "<id>",
      "message": "Moderation review successful",
      "data": {
        "quiz_data": {
          "overall_verdict": {
            "is_appropriate": false,
            "moderation_decision": "content is inappropriate",
            "flagged_cards": [
              {
                "description": "Activates a configured interface.",
                "term": "Tangina mo",
                "reason": "Profanity and offensive language"
              }
            ]
          }
        }
      }
    }
    ```

    or

    ```json
    {
      "status": 200,
      "request_owner_id": "<id>",
      "message": "Moderation review successful",
      "data": {
        "quiz_data": {
          "overall_verdict": {
            "is_appropriate": true,
            "moderation_decision": "content is appropriate",
            "flagged_cards": []
          }
        }
      }
    }
    ```

#### 📝 Quiz Generation

- **POST** `/v2/deck/generate/quiz/:id`

  - **Description:** Generates quiz questions based on provided deck id using Gemini AI.
  - **Path Parameter:**
    - `id` (string) – The user's unique ID.
  - **Request Body:**
    ```json
    {
      "deckId": "<unique_deck_id>"
    }
    ```
  - **Response:**

    ```json
    {
      "status": 200,
      "request_owner_id": "<id>",
      "message": "Quiz creation for deck with id:<id> is successful",
      "data": {
        "quizId": "<quiz_id>"
      }
    }
    ```

    or

    ```json
    {
      "status": 200,
      "request_owner_id": "<id>",
      "message": "There is already a quiz made for this deck in the 'quiz' collection",
      "data": {
        "quiz_id": "<quiz_id>"
      }
    }
    ```

    or

    ```json
    {
      "status": 200,
      "request_owner_id": "<id>",
      "message": "Quiz creation for new flashcards in deck ekZBroavEBX76mAXVG9Z is successful",
      "data": {
          "no_of_new_flashcards": <num_of_new_flashcards_detected>
      }
    }

    ```

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. 🍴 Fork the repository.
2. 🌿 Create a new branch (`git checkout -b feature/YourFeature`).
3. 💻 Commit your changes (`git commit -m 'Add some feature'`).
4. 📤 Push to the branch (`git push origin feature/YourFeature`).
5. 🔄 Open a pull request.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📧 Contact

If you have any questions or suggestions, feel free to [open an issue](#).

---

Thank you for using Deck API Gateway! We hope it helps streamline your productivity workflows and enhances your "Deck" application experience. 🎉
