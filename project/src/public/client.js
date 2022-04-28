let store = Immutable.Map({
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    data: [],
    images: []
});
// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState);
    render(root, store);
  };

const render = async(root, state) => {
    root.innerHTML = App(state)
}
const navigateTo = url => {
    history.pushState(null,null,url);
    router();
};

const getRoverTabs = (rovers) => {
    const roverTabs = [`<a href="/" class = "nav__link" data-link> Home </a>`]
    roverTabs.push(rovers.map(x => {return `<a href="/${x}" class = "nav__link" data-link> ${x} </a>`}))
    return roverTabs
}

// create content
const App = (state) => {
    let name = state.get("user").name
    let apod = state.get("apod")
    let rovers = state.get("rovers")
    let latest_photos  = state.get("images").latest_photos
    let photo_manifest = state.get("data").photo_manifest
    let currentRover = state.get("path").slice(1)

    console.log(state.entries())

    if(state.get("path") != '/'){
        return `
                    <div id = 'app'>
                        <h1>${Greeting(name)}</>
                        <h3>Here you can learn more about the rover ${currentRover}</h3>
                        ${roverInfoGraph(photo_manifest, latest_photos)}
                    </div>`
        }else{
            return `<nav class = "nav">
                        ${getRoverTabs(rovers)}
                    </nav>
                    <div id = 'app'>
                        <h1>${Greeting(name)}</>
                        <p>
                            One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                            the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                            This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                            applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                            explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                            but generally help with discoverability of relevant imagery.
                        </p>
                        ${ImageOfTheDay(apod, state)}
                    </div>
                <footer></footer>`
        }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    document.body.addEventListener('click', e => {
        if(e.target.matches('[data-link]')){
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });
    router()
    //render(root, store)
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
const ImageOfTheDay = (apod, state) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    //const photodate = new Date(apod.date)
    //console.log(photodate.getDate(), today.getDate());

    //console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(state)
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

const router = () => {

    //acceptable paths
    const routes = [
        {path: "/", action: () => console.log("Viewing Dashboard")},
        {path: "/Opportunity", action: () => { console.log("Viewing Opportunity")}},
        {path: "/Curiosity", action: () => {console.log("Viewing Curiosity")}},
        {path: "/Spirit", action: () => {console.log("Viewing Spirit")}}
    ];

    //Test each route to see if it matches our current path location
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch)

    //if the path isn't one of our acceptable routes, set it to the default path
    if(!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }
    if(location.pathname != "/"){
        getRoverData(match.route.path)
        getRoverImages(match.route.path)
    }
    console.log(store)
    console.log("adding path to store")
    match.route.action
    updateStore(store, match.route)
}

const getRoverData = (rover) => {
    console.log("fetching data for " + rover)
    if(rover != "/"){
        fetch(`http://localhost:3000${rover}/data`)
            .then(res => res.json())
            .then(data => { /*console.log(`Rover data: ${JSON.stringify(data)}`);*/ updateStore(store, data)})
            .then(()=>console.log("finished fetching data"))
    }
}

const getRoverImages = (rover) => {
    console.log("fetching images")
    if(rover != "/"){
        fetch(`http://localhost:3000${rover}/photos`)
            .then(res => res.json())
            .then(images => { console.log(`Rover data: ${JSON.stringify(images)}`); updateStore(store, images)})
            .then(()=>console.log("finished fetching images"))
    }
}

const imageGrid = (imageList) => {
    let imageSources = imageList.map(photo => `<img src=${photo.img_src}/>`)
    return imageSources.reduce((acc, curr)=> {
        return acc += curr;
    })
}

const roverInfoGraph = ({ name, launch_date, landing_date, status, max_date }, latest_photos) => {
    console.log("Made graph")
    console.log(name)
        return (
            `<ul>
                <li>Rover Name: ${name}</li>
                <li>Launch Date: ${launch_date}</li>
                <li>Landing Date: ${landing_date}</li>
                <li>Mission Status: ${status}</li>
                <li>Latest Photos: ${max_date}</li>
            </ul>
            <p>${imageGrid(latest_photos)}</p>`
        )
}
