export const TableContent = ({ }) => {
    return (
        <>
            <div className="container">
                <h3>Location Description</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Product Category</th>
                            <th>Unit Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr key={"0"}>
                            <td data-editable="true" >{"product name"}</td>
                            <td data-editable="true" >{"product category"}</td>
                            <td data-editable="true" >{"unit price"}</td>
                            <td />
                        </tr>

                    </tbody>
                </table>
            </div>
        </>
    )
}
export default TableContent;
