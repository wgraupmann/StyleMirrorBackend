# StyleMirrorBackend

<h2>API Key</h2>
The FAL api key must be stored in a local .env file with the a single line <em>API_KEY=your_api_key_here</em>. Then it can be accessed and configured with "dotenv" via: process.env.API_KEY

<h2>Endpoints</h2>
Our backend consists of 3 endpoints:
<ol>
  <li>Submit: Sends our request to FAL API to generate the outfit</li>
  <li>Status: Request the current status of the image generation</li>
  <li>Result: Returns the final result</li>
</ol>

<h2>Postman Examples</h2>
<h3>Submit: POST</h3>
<ul>
  <li><em>/submit</em> is a POST request that takes the outift image, user image, and a description</li>
  <li>Returns the request_id</li>
</ul>
<img width="1026" alt="Screenshot 2024-11-18 at 1 24 22 PM" src="https://github.com/user-attachments/assets/29667651-7660-4009-9a6e-07e16f831f02">

<h3>Status: GET</h3>
<ul>
  <li><em>/status</em> is a GET request that takes request_id</li>
  <li>Returns the status of the image generation and a message that includes the percent completion of the image generation</li>
  <ul>
    <li>STATUS can be IN_QUEUE, IN_PROGRESS, or COMPLETED</li>
  </ul>
</ul>
<img width="1016" alt="Screenshot 2024-11-18 at 1 29 11 PM" src="https://github.com/user-attachments/assets/a2668d69-f69f-45f9-a38b-c907ee65d7cd">

<h3>Result: GET</h3>
<ul>
  <li><em>/result</em> is a GET request that takes the request_id</li>
  <li>Returns the image</li>
</ul>
<img width="1019" alt="Screenshot 2024-11-18 at 1 30 23 PM" src="https://github.com/user-attachments/assets/ce0445f9-6f4c-401e-aeb5-ba34b25295ec">
