# BDL_HOSPITAL

This project appears to be a backend application for a hospital management system, built with Node.js and utilizing an Oracle database.

## Key Features & Benefits

*   **Data Management:** Handles patient, doctor, medicine, billing, and payment information.
*   **Dashboard:** Provides key statistics and insights into hospital operations.
*   **Oracle Database Integration:** Leverages Oracle database for persistent data storage.
*   **REST API:** Exposes endpoints for various operations related to the hospital system.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Node.js:**  Version 12 or higher is recommended. Download from [nodejs.org](https://nodejs.org/).
*   **npm (Node Package Manager):**  Typically bundled with Node.js.
*   **Oracle Database:** An Oracle database instance is required.
*   **Oracle Instant Client:** Required for Node.js to connect to the Oracle database. Make sure the appropriate version is installed and configured.
*   **`oracledb` Node.js module:**  This will be installed during the installation process.
*   `.env` file: With environment variables for connecting to the database, see example below.

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd BDL_HOSPITAL
    ```

2.  **Navigate to the `backend` directory:**

    ```bash
    cd backend
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Configure environment variables:**

    *   Create a `.env` file in the `backend` directory.  See `.env.example` as a template.
    *   Populate the `.env` file with your Oracle database credentials.  Example:

        ```
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_CONNECT_STRING=your_db_connect_string
        ```

        Replace `your_db_user`, `your_db_password`, and `your_db_connect_string` with your actual Oracle database credentials. The connect string should be the standard Oracle connection string format (e.g., `localhost/XEPDB1`).

5.  **Start the application:**

    ```bash
    node server.js
    ```

    This will start the Node.js server, which will listen for incoming requests.

## Usage Examples & API Documentation

The application provides a REST API for interacting with the hospital system.  The controllers provide insights into the available endpoints.  Here are some examples based on the provided controller snippets:

*   **Get All Doctors:**  `GET /doctors` - Retrieves a list of all doctors.
*   **Get All Payments:** `GET /payments` - Retrieves a list of all payments.
*   **Get Pasien for Billing:** `GET /billing/pasien` - Retrieves a list of patients for billing purposes.
*   **Get Dashboard Stats:** `GET /dashboard/stats` - Retrieves dashboard statistics (total patients, doctors, etc.).

Consult the code in the controllers directory (e.g., `backend/controllers/doctorController.js`, `backend/controllers/PaymentController.js`) to understand the available routes and their expected request/response formats.

**Example: Fetching All Doctors (Conceptual)**

```javascript
// (Inside your React component, or other client-side code)
fetch('/doctors')
  .then(response => response.json())
  .then(data => {
    // Process the list of doctors (data)
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching doctors:', error);
  });
```

## Configuration Options

The application uses environment variables for configuration. The primary configuration is the database connection details in the `.env` file:

*   **`DB_USER`:** Oracle database username.
*   **`DB_PASSWORD`:** Oracle database password.
*   **`DB_CONNECT_STRING`:** Oracle database connection string.

## Contributing Guidelines

We welcome contributions to this project!  Here are the general guidelines:

1.  **Fork the repository.**
2.  **Create a new branch for your feature or bug fix.**
3.  **Make your changes and commit them with clear and concise commit messages.**
4.  **Test your changes thoroughly.**
5.  **Submit a pull request to the `main` branch.**

Please ensure your code adheres to the existing code style and includes appropriate tests.

## License Information

License information is currently not specified for this project.

## Acknowledgments

This project utilizes the following third-party libraries:

*   Node.js
*   OracleDB
*   dotenv
