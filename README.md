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
2. ➡️ Go to the function directory
3. 📦 Install dependencies using `npm install`.
4. 🪪 Login to your firebase cli
5. 🏗️ Run `npm run build`.
6. 🚀 Start firebase emulator `firebase emulators:start`.

---

## 📡 API Endpoints

### ⚙️ General Routes

- **GET /v1**
  - **Description**: Checks if the server is running.
  - **Response**:
    - `200 OK`: "Deck Manager API is running"

### 🃏 Deck Routes

- **GET /v1/decks**

  - **Description**: Retrieves all decks.
  - **Response**:
    - `200 OK`: JSON object containing all decks.

- **GET /v1/decks/:deckID**

  - **Description**: Retrieves a specific deck by its ID.
  - **Parameters**:
    - `deckID`: The unique identifier of the deck.
  - **Response**:
    - `200 OK`: JSON object containing the requested deck.
    - `404 Not Found`: Deck not found.

- **POST /v1/decks**

  - **Description**: Creates a new deck.
  - **Request Body**:
    - `title`: The title of the deck.
    - `coverPhoto` (optional): URL of the deck's cover photo.
  - **Response**:
    - `201 Created`: JSON object containing the created deck.
    - `400 Bad Request`: Missing required fields.

- **PUT /v1/decks/:deckID**

  - **Description**: Updates an existing deck by its ID.
  - **Parameters**:
    - `deckID`: The unique identifier of the deck to update.
  - **Request Body** (optional):
    - `title`: The updated title.
    - `coverPhoto`: The updated cover photo URL.
    - `isPrivate`: Set the deck as private or public.
    - `isDeleted`: Marks the deck as deleted.
    - `madeToQuizAt`: Timestamp when the deck was converted to a quiz.
  - **Response**:
    - `200 OK`: JSON object with the updated deck.
    - `400 Bad Request`: Invalid request.
    - `500 Internal Server Error`: Server issues.

- **DELETE /v1/decks/:deckID**
  - **Description**: Hard deletes a deck by its ID.
  - **Parameters**:
    - `deckID`: The unique identifier of the deck.
  - **Response**:
    - `200 OK`: Confirmation of deck deletion.
    - `404 Not Found`: Deck not found.

### 🎴 Flashcard Routes

- **GET /v1/decks/:deckID/flashcards**

  - **Description**: Retrieves all flashcards for a specific deck.
  - **Parameters**:
    - `deckID`: The unique identifier of the deck.
  - **Response**:
    - `200 OK`: JSON object containing all flashcards in the deck.

- **GET /v1/decks/:deckID/flashcards/:flashcardID**

  - **Description**: Retrieves a specific flashcard by its ID.
  - **Parameters**:
    - `deckID`: The deck's unique identifier.
    - `flashcardID`: The flashcard's unique identifier.
  - **Response**:
    - `200 OK`: JSON object containing the requested flashcard.
    - `404 Not Found`: Flashcard not found.

- **POST /v1/decks/:deckID/flashcards**

  - **Description**: Creates a new flashcard in a specific deck.
  - **Parameters**:
    - `deckID`: The deck's unique identifier.
  - **Request Body**:
    - `term`: The term on the flashcard.
    - `definition`: The definition on the flashcard.
  - **Response**:
    - `201 Created`: JSON object containing the created flashcard.
    - `400 Bad Request`: Missing required fields.

- **PUT /v1/decks/:deckID/flashcards/:flashcardID**

  - **Description**: Updates a specific flashcard by its ID.
  - **Parameters**:
    - `deckID`: The deck's unique identifier.
    - `flashcardID`: The flashcard's unique identifier.
  - **Request Body** (optional):
    - `term`: The updated term.
    - `definition`: The updated definition.
    - `isStarred`: Marks the flashcard as starred.
    - `isDeleted`: Marks the flashcard as deleted.
  - **Response**:
    - `200 OK`: JSON object with the updated flashcard.
    - `400 Bad Request`: Invalid request.
    - `500 Internal Server Error`: Server issues.

- **DELETE /v1/decks/:deckID/flashcards/:flashcardID**

  - **Description**: Deletes a specific flashcard by its ID.
  - **Parameters**:
    - `deckID`: The deck's unique identifier.
    - `flashcardID`: The flashcard's unique identifier.
  - **Response**:
    - `200 OK`: Confirmation of flashcard deletion.
    - `404 Not Found`: Flashcard not found.

- **GET /v1/decks/:deckID/flashcards/random**
  - **Description**: Fetches a random set of flashcards from a specific deck.
  - **Parameters**:
    - `deckID`: The unique identifier of the deck.
  - **Response**:
    - `200 OK`: JSON object containing the randomly selected flashcards.

## 🔑 Authentication

The API requires Firebase authentication for all requests. Ensure that the Firebase token is provided in the request headers under `Authorization: Bearer <token>`.

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

Thank you for using Deck Manager API! We hope it helps streamline your productivity workflows and enhances your "Deck" application experience. 🎉
