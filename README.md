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


<h2>FAL API Integration in Kotlin Android</h2>
<p>This section explains how to integrate the <code>fal-client-kotlin</code> library into your Android project to use the FAL API for virtual try-on functionality.</p>

<h3>Setup</h3>
<h4>1. Add Dependency</h4>
<p>Add the following to your <code>build.gradle</code> file to include the FAL client library:</p>
<pre>
<code>
dependencies {
    implementation("ai.fal.client:fal-client-kotlin:0.7.1")
}
</code>
</pre>

<h4>2. Set Your API Key</h4>
<p>The FAL API requires an API key for authentication.</p>
<ul>
  <li>Set it as an environment variable in your development environment:</li>
</ul>
<pre>
<code>
export FAL_KEY="your_api_key_here"
</code>
</pre>
<ul>
  <li>Alternatively, you can pass the API key directly through <code>SubscribeOptions</code>. <strong>Avoid hardcoding API keys in production</strong> for security reasons.</li>
</ul>

<h3>Usage</h3>
<h4>3. Initialize the FAL Client</h4>
<p>Set up the FAL client in your Kotlin code:</p>
<pre>
<code>
import ai.fal.client.kt.createFalClient

val falClient = createFalClient()
</code>
</pre>

<h4>4. Submit a Request</h4>
<p>Submit the human and garment image URLs, along with a description, to generate the virtual try-on image. The client will handle the queue and return the final result upon completion.</p>
<pre>
<code>
import ai.fal.client.kt.model.QueueStatus
import ai.fal.client.kt.model.SubscribeOptions

val input = mapOf(
    "human_image_url" to "https://example.com/human.jpg",
    "garment_image_url" to "https://example.com/garment.jpg",
    "description" to "Short Sleeve Round Neck T-shirts"
)

val result = falClient.subscribe(
    "fal-ai/idm-vton", 
    input, 
    options = SubscribeOptions(logs = true)
) { update ->
    when (update) {
        is QueueStatus.InProgress -> println("Processing: ${update.logs}")
        is QueueStatus.Completed -> println("Image generation completed!")
        is QueueStatus.Failed -> println("Error: ${update.errorMessage}")
    }
}
</code>
</pre>

<h4>5. Retrieve the Result</h4>
<p>Once the status is <code>QueueStatus.Completed</code>, you can access the output image and mask. These can be displayed in your app or stored for further use:</p>
<pre>
<code>
if (result != null) {
    val imageUrl = result["image"]?.url ?: "No image URL"
    val maskUrl = result["mask"]?.url ?: "No mask URL"

    println("Generated Image: $imageUrl")
    println("Mask Image: $maskUrl")
    // Load the image into an ImageView using a library like Glide or Picasso
}
</code>
</pre>

<h4>6. Display Progress</h4>
<p>The <code>subscribe</code> method automatically updates progress during the image generation process. You can log or display this progress in your app's UI by handling the <code>QueueStatus.InProgress</code> status.</p>

<h3>Additional Notes</h3>
<h4>File Uploads</h4>
<p>If you prefer to upload local files instead of using URLs:</p>
<ol>
  <li>Upload the file to a public storage service.</li>
  <li>Use the resulting URL in your FAL API request.</li>
</ol>

<h4>Error Handling</h4>
<p>The FAL client automatically retries failed requests where possible. For unrecoverable errors, the <code>QueueStatus.Failed</code> status will include details in <code>update.errorMessage</code>.</p>

<h3>Testing</h3>
<ul>
  <li>Test with valid public URLs for both <code>human_image_url</code> and <code>garment_image_url</code>.</li>
  <li>Monitor logs during processing to ensure requests are being handled correctly.</li>
  <li>Handle errors gracefully and inform users if processing fails.</li>
</ul>

