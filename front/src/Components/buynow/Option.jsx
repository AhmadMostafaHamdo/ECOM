import React, { useContext } from "react";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../../api";
import "./option.css";
import ConfirmDialog from "../common/ConfirmDialog";

const Option = ({ deletedata, get }) => {
    const { setAccount } = useContext(Logincontext);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const removedata = async (id) => {
        setIsConfirmOpen(false);
        setIsRemoving(true);
        try {
            const res = await fetch(apiUrl(`/remove/${id}`), {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await res.json();

            if (res.status === 400 || !data) {
                return;
            }

            setAccount(data);
            get();
            toast.success("Item removed from cart.", {
                position: "top-center"
            });
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="add_remove_select" key={deletedata}>
            <select name="" id="">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
            <p onClick={() => setIsConfirmOpen(true)} style={{ cursor: "pointer" }}>
                {isRemoving ? "Deleting..." : "Delete"}
            </p>
            <span>|</span>
            <p className="forremovemedia">Save for later</p>
            <span>|</span>
            <p className="forremovemedia">See similar items</p>
            
            <ConfirmDialog 
                open={isConfirmOpen}
                title="Remove Item"
                message="Are you sure you want to remove this item from your cart?"
                confirmText="Remove"
                cancelText="Cancel"
                onConfirm={() => removedata(deletedata)}
                onCancel={() => setIsConfirmOpen(false)}
                loading={isRemoving}
                type="danger"
            />
        </div>
    );
};

export default Option;
