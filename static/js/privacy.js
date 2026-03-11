 // Tab switching functionality
    function switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show selected tab content
        const selectedContent = document.getElementById(`content-${tabName}`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }
        
        // Update tab button styles
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('bg-violet-600', 'text-white');
            button.classList.add('text-gray-600', 'hover:text-violet-600', 'hover:bg-violet-50');
        });
        
        // Style the active tab
        const activeTab = document.getElementById(`tab-${tabName}`);
        if (activeTab) {
            activeTab.classList.remove('text-gray-600', 'hover:text-violet-600', 'hover:bg-violet-50');
            activeTab.classList.add('bg-violet-600', 'text-white');
        }
    }

    // Optional: Set initial tab based on URL hash or default to privacy
    document.addEventListener('DOMContentLoaded', function() {
        // Check if there's a hash in the URL
        const hash = window.location.hash.substring(1); // Remove the #
        if (hash && ['privacy', 'terms', 'community'].includes(hash)) {
            switchTab(hash);
        } else {
            // Default to privacy tab
            switchTab('privacy');
        }
    });

    // Optional: Update URL hash when tab changes (for bookmarking/sharing)
    // Create a safe wrapper that captures the original `switchTab`
    // so assigning a global does not cause recursive calls.
    const _baseSwitchTab = switchTab;
    function switchTabWithHash(tabName) {
        _baseSwitchTab(tabName);
        window.location.hash = tabName;
    }

    // Expose the wrapper as the global `switchTab` used by onclick attributes
    window.switchTab = switchTabWithHash;
