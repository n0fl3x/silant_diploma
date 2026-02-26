import { useState } from "react";
import "../styles/MachineSearch.css";


interface MachineData {
    factory_number: string;
    model_tech_name: string | null;
    engine_model_name: string | null;
    engine_factory_number: string | null;
    transmission_model_name: string | null;
    transmission_factory_number: string | null;
    drive_axle_model_name: string | null;
    drive_axle_factory_number: string | null;
    steering_axle_model_name: string | null;
    steering_axle_factory_number: string | null;
    delivery_contract?: string | null;
    shipment_date?: string | null;
    consignee?: string | null;
    delivery_address?: string | null;
    configuration?: string | null;
    client_name?: string | null;
    service_company_name?: string | null;
};

interface ApiResponse {
    success: boolean;
    data?: MachineData;
    message?: string;
    error?: string;
    user_status?: "authorized" | "unauthorized";
};

export default function MachineSearch() {
    const [factoryNumber, setFactoryNumber] = useState("");
    const [machine, setMachine] = useState<MachineData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userStatus, setUserStatus] = useState<"authorized" | "unauthorized" | null>(null);

    const handleSearch = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMachine(null);
        setUserStatus(null);

        try {
            const accessToken = document.cookie
                .split(";")
                .map( cookie => cookie.trim() )
                .find( cookie => cookie.startsWith("access_token=") )
                ?.split("=")[1];
        
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
        
            if ( accessToken ) {
                headers["Authorization"] = `Bearer ${accessToken}`;
            };
        
            const response = await fetch(
                "/api/v1/machines/search",
                {
                    method: "POST",
                    headers: headers,
                    credentials: "include",
                    body: JSON.stringify(
                        { factory_number: factoryNumber }
                    ),
                }
            );
        
            const data: ApiResponse = await response.json();
        
            if ( data.success && data.data ) {
                setMachine(data.data);
                setUserStatus(data.user_status || "unauthorized")
            }
            else {
                setError(data.message || data.error || "Произошла неизвестная ошибка.")
            }
        }
        catch (err) {
            setError("Ошибка подключения к серверу.");
        }
        finally {
            setLoading(false)
        }
    };

    const renderField = (
        label: string,
        value: string | null | undefined,
        isVisible: boolean
    ) => {
        if ( !isVisible || value === null || value === undefined || value.trim() === "" ) {
            return null
        };

        return (
            <tr>
                <td className="field-label">
                    {label}
                </td>
                <td className="field-value">
                    {value}
                </td>
            </tr>
        )
    };

    return (
        <div className="machine-search-container">
            <h2>
                Поиск машины по заводскому номеру
            </h2>

            {userStatus && (
                <div className={`user-status ${userStatus}`}>
                    Статус: {userStatus === "authorized" ? "Авторизованный пользователь" : "Гость"}
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                    <label htmlFor="factoryNumber">
                        Заводской номер машины:
                    </label>
                    <input
                        type="text"
                        id="factoryNumber"
                        value={factoryNumber}
                        onChange={ (e) => setFactoryNumber(e.target.value) }
                        placeholder="Введите заводской номер"
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Поиск..." : "Найти"}
                </button>
            </form>
          
            {error && <div className="error-message">{error}</div>}
          
            {machine && (
                <div className="machine-result">
                    <h3>
                        Результаты поиска
                    </h3>

                    <div className="section">
                        <h4>
                            Основная информация
                        </h4>
                        
                        <table className="machine-table">
                            <tbody>
                                {renderField("Заводской номер", machine.factory_number, true)}
                                {renderField("Модель техники", machine.model_tech_name, true)}
                                {renderField("Модель двигателя", machine.engine_model_name, true)}
                                {renderField("Зав. № двигателя", machine.engine_factory_number, true)}
                                {renderField("Модель трансмиссии", machine.transmission_model_name, true)}
                                {renderField("Зав. № трансмиссии", machine.transmission_factory_number, true)}
                                {renderField("Модель ведущего моста", machine.drive_axle_model_name, true)}
                                {renderField("Зав. № ведущего моста", machine.drive_axle_factory_number, true)}
                                {renderField("Модель управляемого моста", machine.steering_axle_model_name, true)}
                                {renderField("Зав. № управляемого моста", machine.steering_axle_factory_number, true)}
                            </tbody>
                        </table>
                    </div>

                    {userStatus === "authorized" && (
                        <div className="section authorized-only">
                            <h4>
                                Дополнительная информация (только для авторизованных)
                            </h4>
                            
                            <table className="machine-table">
                                <tbody>
                                    {renderField("Договор поставки", machine.delivery_contract, true)}
                                    {renderField("Дата отгрузки", machine.shipment_date, true)}
                                    {renderField("Грузополучатель", machine.consignee, true)}
                                    {renderField("Адрес доставки", machine.delivery_address, true)}
                                    {renderField("Комплектация", machine.configuration, true)}
                                    {renderField("Клиент", machine.client_name, true)}
                                    {renderField("Сервисная компания", machine.service_company_name, true)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
};
