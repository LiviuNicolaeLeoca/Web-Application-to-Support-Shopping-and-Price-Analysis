document.addEventListener('DOMContentLoaded', () => {
    const scrapeMegaButton = document.getElementById('scrape-mega');
    const scrapePennyButton = document.getElementById('scrape-penny');
    const scrapeKauflandButton = document.getElementById('scrape-kaufland');
    const scrapeAuchanButton = document.getElementById('scrape-auchan');
    const scrapeAllButton = document.getElementById('scrape-all');
    const notification = document.getElementById('notification');

    const showNotification = (message, type) => {
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        setTimeout(() => {
            notification.className = 'notification';
        }, 5000);
    };

    const executeScript = async (url) => {
        disableButtons(true);
        try {
            const response = await fetch(url, { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                showNotification(result.message, 'success');
                console.log('Output:', result.stdout);
                console.error('Error Output:', result.stderr);
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('An error occurred while executing the script.', 'error');
            console.error('Error:', error);
        } finally {
            disableButtons(false); // Re-enable buttons after execution
        }
    };

    const disableButtons = (disabled) => {
        scrapeMegaButton.disabled = disabled;
        scrapePennyButton.disabled = disabled;
        scrapeKauflandButton.disabled = disabled;
        scrapeAuchanButton.disabled = disabled;
        scrapeAllButton.disabled = disabled;
    };

    scrapeMegaButton.addEventListener('click', () => {
        executeScript('/scrape/mega');
    });

    scrapePennyButton.addEventListener('click', () => {
        executeScript('/scrape/penny');
    });

    scrapeKauflandButton.addEventListener('click', () => {
        executeScript('/scrape/kaufland');
    });

    scrapeAuchanButton.addEventListener('click', () => {
        executeScript('/scrape/auchan');
    });

    scrapeAllButton.addEventListener('click', () => {
        executeScript('/scrape/all');
    });
});
