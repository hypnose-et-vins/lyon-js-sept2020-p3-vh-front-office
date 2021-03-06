/* eslint-disable global-require */
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MdEventAvailable } from 'react-icons/md';
import './Eventdetail.scss';
import Button from '@material-ui/core/Button';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { Icon } from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useToasts } from 'react-toast-notifications';
import {
  FacebookShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon,
} from 'react-share';
import { useTranslation } from 'react-i18next';
import { GiWineGlass } from 'react-icons/gi';
import { GoLocation } from 'react-icons/go';
import { BsPerson } from 'react-icons/bs';
import { BiMoney, BiHourglass } from 'react-icons/bi';
import ReactHtmlParser from 'react-html-parser';
import SpinnerLoader from '../../services/Loader';
import { BasketContext } from '../Contexts/BasketContext';
import API from '../../services/API';

const L = require('leaflet');

// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.imagePath = 'node_modules/leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EventDetails = (props) => {
  const [eventData, setEventData] = useState();
  const [eventCoordinate, setEventCoordinate] = useState();
  const [quantity, setQuantity] = useState(1);
  const { addToast } = useToasts();
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const { basket, setBasket } = useContext(BasketContext);

  const { match } = props;
  const eventId = match.params.id;

  useEffect(() => {
    API.get(`/events/${eventId}`).then((res) => setEventData(res.data));
  }, []);

  useEffect(() => {
    if (eventData) {
      const apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${eventData.street.replace(
        / /g,
        '+'
      )}&postcode=${eventData.zipcode}`;
      axios
        .get(apiUrl)
        .then((res) =>
          setEventCoordinate([
            res.data.features[0].geometry.coordinates[1],
            res.data.features[0].geometry.coordinates[0],
          ])
        );
    }
  }, [eventData]);

  const useStyles = makeStyles(() => ({
    btn: {
      height: '50%',
      backgroundColor: '#6d071a',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: '#6d071a',
      },
    },
  }));

  const classes = useStyles();

  const handleClick = () => {
    const currentBasket = basket;
    const isEventExistingInBasket = currentBasket.findIndex(
      (event) => event.id === parseInt(eventId, 10)
    );
    if (isEventExistingInBasket !== -1) {
      if (
        currentBasket[isEventExistingInBasket].quantity +
          parseInt(quantity, 10) <=
        eventData.availabilities
      ) {
        currentBasket[isEventExistingInBasket].quantity += parseInt(
          quantity,
          10
        );
        setBasket(currentBasket);
        addToast(
          `Evénement déjà présent dans votre panier, le nombre de places a été mis à jour`,
          {
            appearance: 'success',
            autoDismiss: true,
          }
        );
      } else {
        addToast(
          `Votre réservation dépasse le nombre de places disponibles (déjà ${currentBasket[isEventExistingInBasket].quantity} places dans votre panier)`,
          {
            appearance: 'error',
            autoDismiss: true,
          }
        );
      }
      setBasket(currentBasket);
    } else {
      const newEvent = {
        id: parseInt(eventId, 10),
        quantity: parseInt(quantity, 10),
      };
      const newBasket = [newEvent, ...currentBasket];
      setBasket(newBasket);
      addToast(`Evénement ajouté à votre panier`, {
        appearance: 'success',
        autoDismiss: true,
      });
    }
  };

  return eventCoordinate ? (
    <section className="event-details-container">
      <Helmet>
        <title>{eventData.title}</title>
      </Helmet>
      <h1 className="title">{eventData.title}</h1>
      <p className="line">________________________</p>
      <div className="event-information">
        <p>
          <BiHourglass size={25} color="#8c0226" />
          &nbsp;
          {eventData.duration_seconds} minutes
        </p>
        <p>
          <BsPerson size={25} color="#8c0226" />
          &nbsp; {eventData.firstname}&nbsp;
          {eventData.lastname}
        </p>

        <p>
          <GiWineGlass size={25} color="#8c0226" />
          &nbsp; &nbsp;
          {eventData.name}&nbsp;-&nbsp;{eventData.producteur}
        </p>

        <p>
          <GoLocation size={25} color="#8c0226" />
          &nbsp;
          {eventData.street}&nbsp;{eventData.zipcode}&nbsp;{eventData.city}
        </p>
        {eventData.availabilities ? (
          <p>
            <MdEventAvailable size={25} color="#8c0226" />
            &nbsp;
            {eventData.availabilities} {t('EventsDetails.p')}
          </p>
        ) : (
          <p style={{ color: 'red' }}>
            <MdEventAvailable size={25} color="#8c0226" />
            &nbsp;
            {t('EventsDetails.pWithoutPlace')}
          </p>
        )}
      </div>
      <div className="event-details">
        <div className="main-page">
          <img
            src={`${process.env.REACT_APP_API_BASE_URL}/${eventData.main_picture_url}`}
            alt="event_image"
          />
          {ReactHtmlParser(eventData.description)}

          {!!eventData.availabilities && ( // need to use this expression, because React return a 0 with eventData.availabilities &&
            <div className="quantity-book">
              <p>
                <BiMoney size={25} color="#8c0226" />
                &nbsp;
                {eventData.price} €
              </p>
              <TextField
                className={classes.input}
                id="standard-number"
                type="number"
                label="Places"
                value={quantity}
                InputProps={{
                  inputProps: { min: 0, max: eventData.availabilities },
                }}
                onChange={(e) => {
                  setQuantity(e.target.value);
                }}
              />
              <Button
                // eslint-disable-next-line react/jsx-boolean-value
                onClick={(event) => handleClick(event)}
                className={classes.btn}
                type="button"
                variant="contained"
                color="primary"
              >
                {t('EventsDetails.button')}
              </Button>
              <div className="logo-event">
                <FacebookShareButton
                  className="facebook"
                  url={window.location.href}
                >
                  <FacebookIcon size={30} borderRadius={50}>
                    Facebook
                  </FacebookIcon>
                </FacebookShareButton>

                <TwitterShareButton
                  className="twitter"
                  url={window.location.href}
                >
                  <TwitterIcon size={30} borderRadius={50}>
                    Twitter
                  </TwitterIcon>
                </TwitterShareButton>
                <Link to="/events">
                  <Button
                    // eslint-disable-next-line react/jsx-boolean-value
                    className={classes.btn}
                    type="button"
                    variant="contained"
                    color="primary"
                  >
                    {t('EventsDetails.button2')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="map">
          <MapContainer
            center={eventCoordinate}
            zoom={13}
            style={{
              height: '620px',
              zIndex: '0',
            }}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={eventCoordinate}
              icon={new Icon({ iconUrl: markerIconPng })}
            >
              <Popup>
                {eventData.street}&nbsp;
                {eventData.zipcode}&nbsp;
                {eventData.city}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </section>
  ) : (
    <SpinnerLoader />
  );
};

export default EventDetails;
