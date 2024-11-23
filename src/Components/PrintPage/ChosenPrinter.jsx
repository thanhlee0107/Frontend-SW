import React, { useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import { GetAvailablePrinters } from "../../api/studentApi"; // Đường dẫn tệp API
import "./ChosenPrinter.css";

function ChosenPrinter() {
  const [formData, setFormData] = useState({
    coSo: "CS1",
    toaNha: "A1",
    tang: "Tầng 1",
  });

  const [printers, setPrinters] = useState([]);
  const [error, setError] = useState("");
  // const [error, setError] = useState(null);
  const [showPrinters, setShowPrinters] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token"); // Thay bằng token của bạn
  console.log(token);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    setError(null); // Xóa lỗi trước đó, có thể xóa
    const { coSo, toaNha, tang } = formData;
    const floorNumber = tang.replace("Tầng ", ""); // Loại bỏ chữ "Tầng"

    try {
      const response = await GetAvailablePrinters(token, coSo, toaNha, floorNumber);

       setPrinters(response.result || []); // Ghi danh sách máy in
      console.log("get api",response.result)

      setShowPrinters(true); // Hiển thị danh sách máy in
      setShowModal(true); // Hiển thị modal với danh sách máy in
      setError(""); // Xóa lỗi

    } catch (err) {
      console.error(err);
      setError("Không thể lấy danh sách máy in. Vui lòng thử lại.");
      setShowPrinters(false);
      setPrinters([]); // Reset danh sách
    }
  };

 

  const handlePrinterSelection = (printer) => {
    console.log("Máy in được chọn:", printer);
    alert(`Bạn đã chọn máy in: ${printer.name}`);
    setShowModal(false); // Đóng modal sau khi chọn máy in
  };
 
  return (
    <div className="file-upload-container">
      <div className="file-upload-header">
        <div className="file-image">
          <PrinterOutlined style={{ fontSize: "24px", color: "#000" }} />
          <h2>Chọn máy in</h2>
        </div>
      </div>

      <div id="wrapper1">
        <div className="input-group">
          <div className="quantity-input-container">
            <form>
              <label>
                Cơ sở
                <select
                  name="coSo"
                  className="node"
                  value={formData.coSo}
                  onChange={handleInputChange}
                >
                  <option value="CS1">CS1</option>
                  <option value="CS2">CS2</option>
                </select>
              </label>
            </form>
          </div>
          <div className="quantity-input-container">
            <form>
              <label>
                Tòa nhà
                <select
                  name="toaNha"
                  className="node"
                  value={formData.toaNha}
                  onChange={handleInputChange}
                >
                  <option value="H1">H1</option>
                  <option value="H2">H2</option>
                  <option value="H3">H3</option>
                  <option value="H6">H6</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="A3">A3</option>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                </select>
              </label>
            </form>
          </div>
          <div className="quantity-input-container">
            <form>
              <label>
                Tầng
                <select
                  name="tang"
                  className="node"
                  value={formData.tang}
                  onChange={handleInputChange}
                >
                  <option value="Tầng 1">Tầng 1</option>
                  <option value="Tầng 2">Tầng 2</option>
                  <option value="Tầng 3">Tầng 3</option>
                  <option value="Tầng 4">Tầng 4</option>
                  <option value="Tầng 5">Tầng 5</option>
                  <option value="Tầng 6">Tầng 6</option>
                  <option value="Tầng 7">Tầng 7</option>
                  <option value="Tầng 8">Tầng 8</option>
                </select>
              </label>
            </form>
          </div>
        </div>
        <div className="button-container">
          <button className="preview-button" onClick={handleSubmit}>
            Chọn máy in
          </button>
        </div>
        {/* <div className="printer-list">
          {error && <p className="error-message">{error}</p>}
          {printers.length > 0 && (
            <ul>
              {printers.map((printer, index) => (
                <li key={index} onClick={() => handlePrinterSelection(printer)}>
                  {printer.name}
                </li>
              ))}
            </ul>
          )}
        </div> */}

        

{/* {showPrinters && (

<div className="printer-list">

    {error && <p className="error-message">{error}</p>}

    {printers.length > 0 ? (

        <ul>

            {printers.map((printer, index) => (

                <li key={index} onClick={() => handlePrinterSelection(printer)}>

                    <p>Tên máy in: {printer.name}</p>

                    <p>Công suất: {printer.capacity}</p>

                    <p>Trạng thái mực đen: {printer.blackWhiteInkStatus}</p>

                    <p>Trạng thái mực màu: {printer.colorInkStatus}</p>

                    <p>Số lượng in chờ: {printer.printWaiting}</p>

                </li>

            ))}

        </ul>

    ) : (

        <p>Không có máy in nào sẵn có.</p>

    )}

</div>

)} */}

{showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowModal(false)}>
                            X
                        </button>
                        <div className="printer-list">
                            {error && <p className="error-message">{error}</p>}
                            {printers.length > 0 ? (
                                <div className="printer-grid">
                                    {printers.map((printer, index) => (
                                        <div className="printer-card" key={index}>
                                            <h3>{printer.name}</h3>
                                            <p>Công suất: {printer.capacity}</p>
                                            <p>Trạng thái mực đen: {printer.blackWhiteInkStatus}</p>
                                            <p>Trạng thái mực màu: {printer.colorInkStatus}</p>
                                            <p>Số lượng in chờ: {printer.printWaiting}</p>
                                            <button
                                                className="select-button"
                                                onClick={() => handlePrinterSelection(printer)}
                                            >
                                                Chọn
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Không có máy in nào sẵn có.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

      </div>
    </div>
  );
}

export default ChosenPrinter;
