import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "./utils/constants";

import { Chart } from "react-google-charts";
import { formatDate } from "./utils/utils";

function App() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [data, setData] = useState([]);
  const [newShopUrl, setNewShopUrl] = useState("");
  const [modalInfo, setModalInfo] = useState(null);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  // useEffect(() => {
  //   fetchShopInfo(modalInfo?.name);
  // }, [modalInfo]);

  // const data = [
  //   ["Date", "Количество товара", "Количество проданного товара", "Количество отзывов"],
  //   ["0", 0, 0, 0],
  //   ["1", 10, 5, 2],
  //   ["2", 23, 15, 5],
  //   ["3", 17, 10, 3],
  //   ["4", 18, 12, 4],
  //   ["5", 9, 7, 1],
  //   ["6", 11, 8, 2],
  //   ["7", 27, 20, 10],
  //   ["8", 33, 25, 15],
  //   ["9", 40, 30, 20],
  //   ["10", 32, 28, 18],
  //   ["11", 35, 30, 22],
  // ];

  const options = {
    chart: {
      title: "",
      hAxis: { title: "Time" },
      vAxis: { title: "Количество" },
      legend: { position: "bottom" },
      series: {
        0: { color: "#e2431e" },
        1: { color: "#f1ca3a" },
        2: { color: "#6f9654" },
      }
    },
  };

  const fetchShops = async () => {
    setIsLoading(true);
    await axios.get(API_URL + "/fetch-shops")
      .then((res) => setShops(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const updateAllShops = async () => {
    setIsLoading(true);
    await axios.post(API_URL + "/start-parsing-all")
      .then((res) => alert(`Обновлено!`))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const fetchShopInfo = async (shopName = "") => {
    setIsLoading(true);
    await axios.get(API_URL + `/fetch-shop-info/${shopName}`)
      .then((res) => {
        const { shopInfo, historyInfo } = res.data;
        console.log(res.data);
        const formattedData = [
          ["Date", "Количество товара", "Количество проданного товара", "Количество отзывов"],
          ...historyInfo.map(item => {
            const formattedDate = formatDate(item.createdAt);
            return [
              formattedDate || "",
              parseInt(item.totalProductCount?.replace(/\s/g, ''), 10),
              parseInt(item.soldProductCount?.replace(/\s/g, ''), 10),
              parseInt(item.totalReviewsCount?.replace(/\s/g, ''), 10),
            ]
          })
        ];
        setData(formattedData);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const updateShopInfo = async () => {
    setIsLoading(true);
    await axios.post(API_URL + `/start-parsing`, modalInfo)
      .then((res) => console.log(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const addNewShop = async () => {
    if (!newShopName || !newShopUrl) return alert(`Нужно ввести имя и ссылку на магазин для добавления!!`);
    setIsLoading(true);
    await axios.post(API_URL + `/add-shop`, { name: newShopName, url: newShopUrl })
      .then((res) => setShops(prev => [...prev, res.data]))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const deleteShop = async () => {
    setIsLoading(true);
    await axios.delete(API_URL + `/delete-shop/${modalInfo?.name}`)
      .then((res) => console.log(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <main>
      <div>
        <ul>
          {
            shops?.length > 0 && shops?.map((shop, i) => (
              <li key={i} onClick={() => { setModalInfo(shop); setDisplayModal(true); fetchShopInfo(shop.name); }}>
                <span>{shop.name || ""}</span>
                <span>{shop.url || ""}</span>
              </li>
            ))
          }
        </ul>
      </div>
      <div style={{ display: "flex", gap: "20px", margin: "10px 0" }}>
        <input style={{ padding: "6px" }} type="text" placeholder="Название магазина" onChange={(e) => setNewShopName(e.target.value)} />
        <input style={{ padding: "6px" }} type="text" placeholder="Ссылка на магазин" onChange={(e) => setNewShopUrl(e.target.value)} />
        <span style={{ border: "1px solid", padding: "7px", cursor: "pointer" }} onClick={() => addNewShop()}>Добавить магазин</span>
      </div>
      <span style={{ border: "1px solid", padding: "7px", cursor: "pointer" }} onClick={() => updateAllShops()}>Обновить все магазины</span>
      {
        displayModal && <div className="shop-modal">
          <h3>{modalInfo?.name}</h3>
          <span>{modalInfo?.url}</span>
        </div>
      }
      {
        (displayModal && !isLoading) && <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ border: "1px solid", padding: "7px", cursor: "pointer", }} onClick={() => updateShopInfo()}>Обновить данные</span>
          <span style={{ border: "1px solid", padding: "7px", cursor: "pointer", color: "red" }} onClick={() => deleteShop()}>Удалить магазин</span>
        </div>
      }
      {
        (displayModal && !isLoading) && <Chart
          chartType="LineChart"
          width="100%"
          height="400px"
          data={data}
          options={options}
        />
      }
      {
        (displayModal && isLoading) && <h1>Подгружаем данные...</h1>
      }
    </main>
  )
}

export default App;