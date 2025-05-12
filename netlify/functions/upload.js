const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Only POST allowed" };
  }

  const body = JSON.parse(event.body);
  const videoBase64 = body.video;
  if (!videoBase64) {
    return { statusCode: 400, body: "Missing video payload" };
  }

  const inputPath = "/tmp/input.mp4";
  const outputPath = "public/output/optimized.mp4";
  fs.writeFileSync(inputPath, Buffer.from(videoBase64, "base64"));

  const cmd = `ffmpeg -i ${inputPath} -vf "scale=640:-1" -c:v libx264 -preset fast -crf 28 -c:a copy ${outputPath}`;

  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        resolve({ statusCode: 500, body: "FFmpeg failed: " + stderr });
      } else {
        resolve({
          statusCode: 200,
          body: JSON.stringify({
            url: "https://stealth.rentingmadeeasy.homes/output/optimized.mp4",
          }),
        });
      }
    });
  });
};
