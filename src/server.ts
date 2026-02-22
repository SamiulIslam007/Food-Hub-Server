import app from "./app";
import config from "./config";

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`FoodHub server is running on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
