
let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


const router = async () => {
    console.log(location.pathname)
    const routes = [
        {path: "/", action: () => console.log("Viewing Dashboard")},
        {path: "/Opportunity", action: () => {roverData(store, "/Opportunity"); console.log(this.path)}},
        {path: "/Curiosity", action: () => {roverData(store, "/Curiosity"); console.log("Viewing Curiosity")}},
        {path: "/Spirit", action: () => {roverData(store, "/Spirit"); console.log("Viewing Spirit")}}
    ];

    //Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch)

    if(!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }
    match.route.action();
};

// create content
const App = (state) => {
    let { apod } = state
    let viewObject = [].concat(state)
    console.log(viewObject)

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <body>
                <nav class = "nav">
                    <a href="/${store.rovers[0]}" class = "nav__link" data-link> ${store.rovers[0]} </a>
                    <a href="/${store.rovers[1]}" class = "nav__link" data-link> ${store.rovers[1]} </a>
                    <a href="/${store.rovers[2]}" class = "nav__link" data-link> ${store.rovers[2]} </a>
                </nav>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>${Object.keys(state)}</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </body>
        </main>
        <footer></footer>
    `
}


const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    console.log("here")
    document.addEventListener("click", e => {
        console.log("now here")
        if(e.target.matches("data-link")){
            e.preventDefault();
            navigateTo(e.target.href)
        }
    })
    router()
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return apod
}

const roverData = (state, rover) => {
    let { apod } = state
    console.log("fetching data")
    fetch(`http://localhost:3000${rover}Data`)
        .then(res => res.json())
        .then(json => updateStore(store, json))

    //return data
}

