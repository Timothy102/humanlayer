import { HumanLayer, ResponseOption } from "humanlayer";
import { config } from "dotenv";
import {
  Classification,
  classificationValues,
  classifyEmail,
  twoEmailsShuffled,
} from "./common";
import { db } from './db';

config();

const hl = new HumanLayer({
  verbose: true,
  runId: "email-classifier-async",
  contactChannel: {
    slack: {
      channel_or_user_id: "",
      context_about_channel_or_user: "",
      experimental_slack_blocks: true,
    },
  },
});

async function main() {
    await db.initialize();
    console.log("\nStarting email classification...\n");
  
    // Use Promise.all with map instead of forEach
    await Promise.all(twoEmailsShuffled.map(async (email) => {
      const classification = await classifyEmail(email);
      console.log(
        `Classification for "${email.subject}" was ${classification}, getting human review`,
      );

      const { subject, body, to, from } = email;
      const remainingOptions = classificationValues.filter(
        (c) => c !== classification,
      );
      const responseOptions: ResponseOption[] = remainingOptions.map((c) => ({
        name: c,
        title: c,
        description: `Classify as ${c}`,
        prompt_fill: `manual classify: ${c}`,
        interactive: false,
      }));

      const functionCall = await hl.createFunctionCall({
        spec: {
          fn: "classifyEmail",
          kwargs: { to, from, subject, body, classification },
          reject_options: responseOptions,
          webhook_url: process.env.WEBHOOK_URL
        }
      });
      console.log(functionCall)
    }));
  
    console.log("\nAll classification requests initiated!");
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});