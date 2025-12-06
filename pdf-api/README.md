# PDF Generation API (PHP + mPDF)

This is a simple PHP API for generating PDFs from HTML using the [mPDF](https://mpdf.github.io/) library. It is designed to be hosted separately and used by your main project to generate cutting plan PDFs.

## Features
- Accepts POST requests with JSON data.
- Uses a Handlebars-like HTML template (`export-template.html` in the project root).
- Generates and returns a PDF file using mPDF.

## Setup

1. **Clone or copy this folder (`pdf-api`) to your server.**
2. **Install dependencies:**

   ```bash
   cd pdf-api
   composer install
   ```

3. **Make sure the main HTML template (`export-template.html`) is present in the root of your main project and accessible to this API.**

4. **Configure your web server to serve `pdf-api/public` as the document root.**
   - For Apache, set `DocumentRoot` to `/path/to/pdf-api/public`.
   - For Nginx, set `root` to `/path/to/pdf-api/public`.

## Usage

- **Endpoint:** `POST /`
- **Content-Type:** `application/json`
- **Body:** JSON object with all variables required by the template, including an array `groupedCutPlans`.

Example request body:
```json
{
  "date": "01/07/2024",
  "totalSheets": 5,
  "efficiency": 92.3,
  "waste": 7.7,
  "totalSheetsArea": 12.5,
  "totalUsedArea": 11.5,
  "totalWastedArea": 1.0,
  "totalPlacements": 42,
  "additionalSheetsNeeded": 0,
  "additionalSheetsNeededClass": "hidden-block",
  "unplacedPanelsCount": 0,
  "unplacedPanelsCountClass": "hidden-block",
  "groupedCutPlans": [
    {
      "planNumber": 1,
      "totalPlans": 2,
      "width": 2.5,
      "length": 2.0,
      "count": 3,
      "sheetArea": 5.0,
      "totalSheetArea": 15.0,
      "usedArea": 13.8,
      "efficiency": 92.0,
      "wastedArea": 1.2,
      "wastedPercentage": 8.0,
      "placements": 21,
      "totalCuts": 10,
      "diagram": "<svg><!-- ... --></svg>"
    }
    // ... more plans
  ]
}
```

- **Response:** PDF file (`application/pdf`)

## CORS
CORS is enabled for all origins by default. Adjust headers in `public/index.php` if you need to restrict access.

## Integration
- From your main project, make a POST request to the PDF API with the required data.
- The API will return a PDF file for download or further processing.

## License
MIT 