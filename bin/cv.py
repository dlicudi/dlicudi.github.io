import yaml
from jinja2 import Environment, FileSystemLoader
import json
import subprocess

# Load YAML data
with open('cv.yaml', 'r', encoding='utf-8') as file:
    cv_data = yaml.safe_load(file)

# Setup Jinja environment
env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('cv.jinja')  # Updated to match

# render CV from template using cv_data
cv = cv_data['cv']

# Output markdown CV to file using cv_data filename is render-online-cv.md
with open('../docs/cv.md', 'w') as file:
    file.write(template.render(cv=cv))

# Define the command
command = [
    "rendercv",
    "render",
    "cv.yaml", 
    "--pdf-path",
    "../pdf",
    "--dont-generate-markdown",
    "--dont-generate-html",
    "--dont-generate-png"
]

try:
    # Execute the command
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    print("PDF generated successfully.")
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print(f"An error occurred while generating the PDF:\n{e.stderr}")
