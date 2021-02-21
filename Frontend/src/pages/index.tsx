import Navbar from "../components/navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";


const Index = () => <><Navbar/><div>hello world</div></>;

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);