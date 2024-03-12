import {Component} from 'react'
import {Link} from 'react-router-dom'
import {BsDashSquare, BsPlusSquare} from 'react-icons/bs'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAIL',
  success: 'SUCSESS',
  loading: 'LOADING',
  failure: 'FAILURE',
}

class ProductItemDetails extends Component {
  state = {
    specificProduct: {},
    similarProducts: [],
    quantity: 1,
    activeApiStaus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getSpecificProductDetails()
  }

  onSuccessFullResponse = (specificProduct, similarProducts) => {
    this.setState({
      specificProduct,
      similarProducts,
      activeApiStaus: apiStatusConstants.success,
    })
  }

  getSpecificProductDetails = async () => {
    this.setState({activeApiStaus: apiStatusConstants.loading})

    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok === true) {
      const updatedProductsDetails = {
        id: data.id,
        imageUrl: data.image_url,
        title: data.title,
        price: data.price,
        description: data.description,
        brand: data.brand,
        totalReviews: data.total_reviews,
        rating: data.rating,
        availability: data.availability,
      }

      const updatedSimilarProductsList = data.similar_products.map(
        eachItem => ({
          id: eachItem.id,
          imageUrl: eachItem.image_url,
          title: eachItem.title,
          price: eachItem.price,
          brand: eachItem.brand,
          rating: eachItem.rating,
        }),
      )

      this.onSuccessFullResponse(
        updatedProductsDetails,
        updatedSimilarProductsList,
      )
    } else if (response.status === 404) {
      this.setState({activeApiStaus: apiStatusConstants.failure})
    }
  }

  renderSuccessView = () => {
    const {specificProduct, similarProducts, quantity} = this.state
    const {
      id,
      imageUrl,
      title,
      price,
      description,
      brand,
      totalReviews,
      rating,
      availability,
    } = specificProduct

    return (
      <div className="prod-details-bg-cont">
        <Header />
        <div className="prod-details-cont">
          <img className="prod-details-img" src={imageUrl} alt="product" />
          <div className="prod-description-cont">
            <h1 className="prod-title-h1">{title}</h1>
            <p className="prod-price-p">RS {price}/-</p>
            <div className="review-cont">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star"
                />
              </div>
              <p className="review-p">{totalReviews} Reviews</p>
            </div>
            <p className="desc-p">{description}</p>
            <p className="brand-span">
              <span className="brand-p">Available:</span> {availability}
            </p>
            <p className="brand-span">
              <span className="brand-p">Brand:</span> {brand}
            </p>
            <hr className="hr-line" />
            <div className="quantity-cont">
              <button
                data-testid="minus"
                className="quantity-btn"
                type="button"
                onClick={this.subtractQuantity}
              >
                <BsDashSquare />
              </button>

              <p className="quantity-p">{quantity}</p>
              <button
                data-testid="plus"
                className="quantity-btn"
                type="button"
                onClick={this.addQuantity}
              >
                <BsPlusSquare />
              </button>
            </div>
            <button className="add-cart-btn" type="button">
              ADD TO CART
            </button>
          </div>
        </div>
        <div className="similar-cont">
          <h1 className="similar-h1">Similar Products</h1>
          <ul className="similar-prod-cont">
            {similarProducts.map(eachItem => (
              <SimilarProductItem itemDetails={eachItem} key={eachItem.id} />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  renderFailureView = () => (
    <>
      <Header />
      <div className="prod-details-failure-view">
        <img
          className="prod-details-failure-img"
          src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
          alt="failure view"
        />
        <h1 className="prod-details-err-p">Product Not Found</h1>
        <Link to="/products" className="route-link">
          <button className="add-cart-btn fail-btn" type="button">
            Continue Shopping
          </button>
        </Link>
      </div>
    </>
  )

  renderLoadingView = () => (
    <>
      <Header />
      <div className="prod-details-failure-view">
        <div data-testid="loader">
          <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
        </div>
      </div>
    </>
  )

  subtractQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  addQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  render() {
    const {activeApiStaus} = this.state
    const renderActiveView = () => {
      switch (activeApiStaus) {
        case apiStatusConstants.success:
          return this.renderSuccessView()
        case apiStatusConstants.failure:
          return this.renderFailureView()
        case apiStatusConstants.loading:
          return this.renderLoadingView()
        default:
          return null
      }
    }

    return <>{renderActiveView()}</>
  }
}

export default ProductItemDetails
