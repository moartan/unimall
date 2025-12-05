import { useContext } from "react";
import { WishlistContext } from "./WishlistContext.jsx";

export const useWishlist = () => useContext(WishlistContext);
