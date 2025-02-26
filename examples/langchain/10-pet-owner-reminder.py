from datetime import datetime
from typing import List, Dict
import os

import langchain_core.tools as langchain_tools
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType, initialize_agent
from pydantic import BaseModel

from humanlayer import ContactChannel, EmailContactChannel
from humanlayer.core.approval import HumanLayer

# Load environment variables
load_dotenv()

# Initialize HumanLayer
hl = HumanLayer(
    verbose=True,
    run_id="email-pet-care-reminders",
)

task_prompt = """
You are Pawsy, the pet care reminder assistant. Send cute reminders to pet owners about their pet care tasks.

For this demo, send email reminders for:
1. Max's daily walk
2. Whiskers' weekly grooming

Make each message cute and include a fun pet fact.
"""

# Define email channel
email_channel = ContactChannel(
    email={
        "address": "tim@humanlayer.dev",
        "to": ["tim@humanlayer.dev"],
        "subject_template": "Pet Care Reminder: {{ pet_name }}'s {{ task_type }}",
    }
)


@hl.require_approval(contact_channel=email_channel)
def send_dog_reminder(pet_name: str, task_type: str) -> str:
    """Send a reminder email about a dog care task
    
    Args:
        pet_name: Name of the dog
        task_type: Type of task (feeding, walking, etc.)
        
    Returns:
        status: Confirmation of email sent
    """
    message = f"""Woof woof! 🐕

Hello there!

It's time for {pet_name}'s daily {task_type}! 

Did you know? Dogs' sense of smell is 10,000 to 100,000 times stronger than humans'! That's why {pet_name} loves exploring all those interesting scents during walks.

Happy walking!
Pawsy 🐾"""
    
    print(f"[EMAIL REMINDER - DOG]")
    print(f"Pet: {pet_name}")
    print(f"Task: {task_type}")
    print(f"Message: {message}")
    
    return f"Email reminder sent for {pet_name}'s {task_type}"


@hl.require_approval(contact_channel=email_channel)
def send_cat_reminder(pet_name: str, task_type: str) -> str:
    """Send a reminder email about a cat care task
    
    Args:
        pet_name: Name of the cat
        task_type: Type of task (feeding, grooming, etc.)
        
    Returns:
        status: Confirmation of email sent
    """
    message = f"""Meow! 🐈

Hello there!

Don't forget {pet_name}'s weekly {task_type} session! 

Did you know? Cats spend about 70% of their lives sleeping! That's why {pet_name} needs regular grooming to keep that beautiful fur in good condition, even during all those nap times.

Happy grooming!
Pawsy 🐾"""
    
    print(f"[EMAIL REMINDER - CAT]")
    print(f"Pet: {pet_name}")
    print(f"Task: {task_type}")
    print(f"Message: {message}")
    
    return f"Email reminder sent for {pet_name}'s {task_type}"


# Define the tools
tools = [
    langchain_tools.StructuredTool.from_function(send_dog_reminder),
    langchain_tools.StructuredTool.from_function(send_cat_reminder),
]

llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
    handle_parsing_errors=True,
)

if __name__ == "__main__":
    print("🐾 Pawsy Pet Care Reminder System 🐾")
    print("Sending reminders through Email with Web approval...")
    
    try:
        # This will run the agent and cause it to use the email channel
        # It will wait for human approval via the web interface
        result = agent.run(task_prompt)
        print("\n\n----------Result----------\n\n")
        print(result)
    except Exception as e:
        print(f"\n\nERROR: {e}")
        print("\nTroubleshooting steps:")
        print("1. Verify your HUMANLAYER_API_KEY is correct")
        print("2. Check that your email configuration is valid")
        print("3. Ensure you have sufficient permissions in your HumanLayer account")
        print("4. Check the HumanLayer dashboard for any service issues")