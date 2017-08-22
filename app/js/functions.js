document.addEventListener("DOMContentLoaded", function(event) { 

    var $overlay = document.getElementById("overlay"),
        $searchForm = document.getElementById("search-form"),
        $searchField = document.getElementById("search"),
        $searchResults = document.getElementById("search-suggestions"),
        $searchResultsList = $searchResults.querySelector("ul"),
        $searchResultsLi = $searchResults.querySelector("li"),
        $previousSearches = document.getElementById("previous-results"),
        $remove = document.getElementsByClassName("remove"),
        apiExecuted = false;

    (function init() {
        $searchField.oninput = (debounce(function (event) {
            lookForPlaces();
        }, 700));
        $searchForm.onsubmit = function(event){ submitForm(event); };
    })();

    /*
     * Debouncing function to not run to often
     */
    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
            fn.apply(context, args);
            }, delay);
        };
    }

    /*
     * Doing AJAX-call to API only one time
     * Building a list of data returned from API
     * Filtering list
     */
    function lookForPlaces() {
        var xhttp = new XMLHttpRequest(),
            url = 'http://api.arbetsformedlingen.se/af/v0/platsannonser/soklista/lan'

        if (apiExecuted !== true) {
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    var jsonObj = JSON.parse(this.responseText);
                    
                    for (var index = 0; index < jsonObj.soklista.sokdata.length; index++) {               
                        var li = document.createElement("li");
                        li.appendChild(document.createTextNode(jsonObj.soklista.sokdata[index].namn));
                        $searchResultsList.appendChild(li);
                        li.addEventListener('click', selectSuggestions, false);
                    }
                    filterList();
                }
                
                else if (this.readyState === 4 && this.status !== 200) {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode('Error: ' + this.status));
                    $searchResultsList.appendChild(li);
                    $searchResults.classList.remove("hide");
                }
            };
            xhttp.open("GET", url, true);
            xhttp.send();

            apiExecuted = true;
        } else {
            filterList();
        }
    }

    /*
     * Filter list of suggestions and hides/shows the list
     */
    function filterList() {
        var filter = $searchField.value.toUpperCase(),
            li = $searchResultsList.getElementsByTagName('li');
        
        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            if (li[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].classList.remove("hide");
            } else {
                li[i].classList.add("hide");
            }
        }

        if ($searchField.value.length > 0){
            hideSuggestions('show');
        }
        else {
            hideSuggestions('hide');
        }
    };

    /*
     * Appending selection to list
     * Adding eventhandlers to remove listitem
     * Hide list and set input value to null after adding item to list
     */
    function addToList(title) {
        var html = '<div class="result">'+
                        '<div class="title">'+
                            title+
                        '</div>'+
                        '<div class="date">'+
                            addTimeStap()+
                        '</div>'+
                        '<div class="remove">'+
                            '<span class="close">x</span>'+
                        '</div>';
                    '</div>'
        $previousSearches.insertAdjacentHTML('beforeend', html);
        for (var i = ($remove.length - 1); i < $remove.length; i++) {
            $remove[i].addEventListener('click', removeEntry, false);
        };
        hideSuggestions('hide');
        $searchField.value = null;
    };
    
    /*
     * Submiting the form adds input's value to list
     */
    function submitForm(event) {
        event.preventDefault();
        var fieldValue = $searchField.value;
        addToList(fieldValue);
    }

    /*
     * Clicking on a suggestions adds this to the list
     */
    function selectSuggestions(event) {
        var suggestionValue = this.innerHTML;
        addToList(suggestionValue);
    };

    /*
     * Create and return timestap
     */
    function addTimeStap() {
        var date = new Date();
        var str = date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2) + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2);
        return str;
    };

    /*
     * Removes an item in the list
     */
    function removeEntry() {
        closestByClass(this, "result").remove();
    };

    /*
     * Helpfunction to find closest parent element by class
     */
    function closestByClass (el, clazz) {
        while (el.className != clazz) {
            el = el.parentNode;
            if (!el) {
                return null;
            }
        }
        return el;
    };

    /*
     * Hiding/Showing list and overlay
     */
    function hideSuggestions(state) {
        if(state === 'hide') {
            $searchResults.classList.add("hide");
            $overlay.classList.add("hide");
        }
        else if(state === 'show') {
            $searchResults.classList.remove("hide");
            $overlay.classList.remove("hide");
        }
    };
});