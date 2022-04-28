// ------------------------------------------------------  ROUTING AND STATE HANDLING

let store = Immutable.Map({
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

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return apod
}

//update store with rover data
const getRoverData = (rover) => {
    console.log("fetching data for " + rover)
    if(rover != "/"){
        fetch(`http://localhost:3000${rover}/data`)
            .then(res => res.json())
            .then(data => {updateStore(store, data)})
            .then(()=>console.log("finished fetching data"))
    }
}

//update store with rover images
const getRoverImages = (rover) => {
    console.log("fetching images")
    if(rover != "/"){
        fetch(`http://localhost:3000${rover}/photos`)
            .then(res => res.json())
            .then(images => {updateStore(store, images)})
            .then(()=>console.log("finished fetching images"))
    }
}

// ------------------------------------------------------  COMPONENTS

const ImageOfTheDay = (apod, state) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(state)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <figcaption class="figure-caption">${apod.explanation}</figcaption>
        `)
    } else {
        return (`
                <img src="${apod.image.url}" height="350px" width="100%"/>
                <p>${apod.image.explanation}</p>
        `)
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
            `<dl class='row'>
                <dt class="col-sm-2">Rover Name:</dt>
                <dd class="col-sm-9">${name}</dd>
                <dt class="col-sm-2">Launch Date:</dt>
                <dd class="col-sm-9">${launch_date}</dd>
                <dt class="col-sm-2">Landing Date:</dt>
                <dd class="col-sm-9">${landing_date}</dd>
                <dt class="col-sm-2">Mission Status:</dt>
                <dd class="col-sm-9">${status}</dd>
                <dt class="col-sm-2">Latest Photos:</dt>
                <dd class="col-sm-9">${max_date}</dd>
            </dl>
            <p>${imageGrid(latest_photos)}</p>`
        )
}

// ------------------------------------------------------  CREATE PAGE CONTENT

const App = (state) => {
    let apod = state.get("apod")
    let latest_photos  = state.get("images").latest_photos
    let photo_manifest = state.get("data").photo_manifest
    let currentRover = state.get("path").slice(1)

    console.log(state.entries())

    if(state.get("path") != '/'){
        return `
                    <div id = 'app'>
                        <div>
                        <h1>Welcome!</>
                        <h2>Here you can learn more about the rover ${currentRover}.</h2>
                        </div>
                        <div>
                        ${roverInfoGraph(photo_manifest, latest_photos)}
                        </div>
                    </div>`
        }else{
            return `
                    <div id = 'app'>
                        <div>
                        <h1>Welcome!</>
                        <p>
                            Here you can view the latest data on the NASA rovers Curiosity, Opportunity and Spirit.
                        </p>
                        </div>
                        <div>
                        ${ImageOfTheDay(apod, state)}
                        </div>
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
})