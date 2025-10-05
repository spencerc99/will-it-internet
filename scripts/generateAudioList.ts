import { readdirSync } from "fs";
import { writeFileSync } from "fs";
import { join } from "path";

const audioDir = join(process.cwd(), "public/3");
const outputFile = join(process.cwd(), "src/audioFiles.json");

try {
  const files = readdirSync(audioDir)
    .filter((file) => file.match(/\.(m4a|mp3|wav|ogg)$/i))
    .sort()
    .map((file) => {
      const match = file.match(/^\d{8}_\d{6}_(.+)\.(m4a|mp3|wav|ogg)$/i);
      const name = match ? match[1] : file.replace(/\.(m4a|mp3|wav|ogg)$/i, "");

      return {
        path: `/3/${file}`,
        name: name,
      };
    });

  writeFileSync(outputFile, JSON.stringify(files, null, 2));
  console.log(`Generated audio list with ${files.length} files`);
} catch (error) {
  console.error("Error generating audio list:", error);
  writeFileSync(outputFile, JSON.stringify([], null, 2));
}
