(function () {
    function init() {
        var btn = document.getElementById('shareBtn');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var data = { title: document.title, url: window.location.href };
            if (navigator.share) {
                navigator.share(data).catch(function () {});
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(data.url).then(function () {
                    var orig = btn.textContent;
                    btn.textContent = 'Link copied!';
                    setTimeout(function () { btn.textContent = orig; }, 2000);
                }).catch(function () {});
            }
        });
    }
    document.addEventListener('DOMContentLoaded', init);
}());
