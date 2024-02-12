import { Link } from "react-router-dom";
import routes from "../routes";

const HomeView = () => {
    return (
        <div className="home-page">
            <div className="flex justify-center py-32 px-6 text-center">
                <div>
                    <h1 className="text-shadow mb-5 text-white">
                        Blockchain Based Ticketing
                    </h1>
                    <div className="flex justify-center">
                        <Link to={routes.events()}>
                            <div className="btn text-white">Browse Events</div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
