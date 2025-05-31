// Simple API test using native Node.js modules
const https = require("http");

const options = {
  hostname: "localhost",
  port: 8080,
  path: "/api/advancedsearch/?laptop_model=hp&limit=2",
  method: "GET",
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      console.log("Success:", parsed.success);
      console.log("Total:", parsed.total);
      console.log("Laptops found:", parsed.laptops?.length || 0);

      if (parsed.laptops && parsed.laptops.length > 0) {
        console.log("\nFirst laptop structure:");
        console.log("Keys:", Object.keys(parsed.laptops[0]));
        console.log("Brand:", parsed.laptops[0].brand);
        console.log("Series:", parsed.laptops[0].series);
        console.log("Has specs:", !!parsed.laptops[0].specs);
        console.log("Has sites:", !!parsed.laptops[0].sites);
        if (parsed.laptops[0].specs) {
          console.log("Specs keys:", Object.keys(parsed.laptops[0].specs));
        }
      }
    } catch (e) {
      console.log("Error parsing JSON:", e.message);
      console.log("Raw data length:", data.length);
    }
  });
});

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
