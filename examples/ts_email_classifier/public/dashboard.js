function createEmailCard(email) {
  return `
    <div class="bg-white rounded-lg shadow overflow-hidden mb-4">
      <div class="flex">
        <div class="w-64 bg-gray-50 p-4 border-r">
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-green-500">✓</span>
              <span>Initial Classification</span>
            </div>
          </div>
        </div>
        
        <div class="flex-1 p-4">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-medium">${email.email_subject}</h3>
              <p class="text-sm text-gray-500">
                From: ${email.email_from} | To: ${email.email_to}
              </p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm ${
              email.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }">
              ${email.status}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium">AI Classification</h4>
              <div class="p-2 bg-blue-50 rounded text-sm">
                ${email.ai_classification}
              </div>
            </div>
            ${email.human_classification ? `
              <div>
                <h4 class="text-sm font-medium">Human Classification</h4>
                <div class="p-2 bg-green-50 rounded text-sm">
                  ${email.human_classification}
                </div>
              </div>
            ` : ''}
          </div>
          
          ${email.human_comment ? `
            <div class="mt-4">
              <h4 class="text-sm font-medium">Comment</h4>
              <p class="text-sm mt-1 p-2 bg-gray-50 rounded italic">
                "${email.human_comment}"
              </p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

async function updateDashboard() {
  try {
    const response = await fetch('/api/classifications/poll');
    const data = await response.json();
    const classifications = data.classifications;
    
    const stats = {
      total: classifications.length,
      pending: classifications.filter(c => c.status === 'pending').length,
      completed: classifications.filter(c => c.status === 'completed').length
    };
    
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="bg-white rounded-lg shadow mb-8 p-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold">Email Classification Dashboard</h1>
            <div class="flex gap-4 text-sm">
              <span>Pending: ${stats.pending}</span>
              <span>Completed: ${stats.completed}</span>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          ${classifications.map(email => createEmailCard(email)).join('')}
        </div>
        
        <div class="text-center text-sm text-gray-500 mt-4">
          Auto-updating every 1 second.
        </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Initial load and polling
updateDashboard();
setInterval(updateDashboard, 1000);