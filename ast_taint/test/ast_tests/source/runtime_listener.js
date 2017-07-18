/**
 * Created by dimitri on 18/07/2017.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case 'send_to_bg':
      send_to_bg(request.message);
  }
});