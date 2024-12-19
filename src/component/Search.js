import React, { useState } from 'react';

const SearchBoxWithResponse = () => {
    const [searchText, setSearchText] = useState('');
    const [responses, setResponses] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState(null); // For the modal content
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const handleSearch = async () => {
        if (!searchText) return;

        try {
            const response = await fetch('https://airtable-task-ten.vercel.app/fetch-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: searchText }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch responses');
            }

            const data = await response.json();
            setResponses(data.activePlacements || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const PlacementDetails = async (query) => {
        setDetails(null);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://airtable-task-ten.vercel.app/fetch-placement-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            if (response.ok) {
                setDetails(data);
            } else {
                setError(data.error || "Failed to fetch details.");
            }
        } catch (err) {
            setError("An error occurred while fetching details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Enter search term"
                style={{ padding: '10px', width: '60%', fontSize: '16px' }}
            />
            <button
                onClick={handleSearch}
                style={{ padding: '10px 20px', marginLeft: '10px', fontSize: '16px' }}
            >
                Enter
            </button>

            <div style={{ marginTop: '20px' }}>
                {responses.length > 0 ? (
                    responses.map((single_response, index) => {
                        const modalId = `responseModal${index}`;
                        return (
                            <React.Fragment key={index}>
                                {/* Modal */}
                                <div
                                    className="modal fade"
                                    id={modalId}
                                    tabIndex="-1"
                                    aria-labelledby={`${modalId}Label`}
                                    aria-hidden="true"
                                >
                                
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id={`${modalId}Label`}>
                                                    <b>{loading ? (
                                                        <p>Loading details</p>
                                                    ) : error ? (
                                                        <p style={{ color: 'red' }}>{error}</p>
                                                    ) : details?.headline ? (
                                                        <pre>{details.headline}</pre>
                                                    ) : (
                                                        <p>No job description available.</p>
                                                    )}</b>
                                                </h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    data-bs-dismiss="modal"
                                                    aria-label="Close"
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <p><strong>Contact Name:</strong></p>
                                                {loading ? (
                                                    <p>...</p>
                                                ) : error ? (
                                                    <p style={{ color: 'red' }}>{error}</p>
                                                ) : details?.contactName ? (
                                                    <pre>{details.contactName}</pre>
                                                ) : (
                                                    <p>No Contact Name available.</p>
                                                )}
                                                <p><strong>Contact Email:</strong></p>
                                                {loading ? (
                                                    <p>...</p>
                                                ) : error ? (
                                                    <p style={{ color: 'red' }}>{error}</p>
                                                ) : details?.contactEmail ? (
                                                    <pre>{details.contactEmail}</pre>
                                                ) : (
                                                    <p>No Contact Email available.</p>
                                                )}
                                                <p><strong>Job Description:</strong></p>
                                                {loading ? (
                                                    <p>...</p>
                                                ) : error ? (
                                                    <p style={{ color: 'red' }}>{error}</p>
                                                ) : details?.jobDescription ? (
                                                    <pre>{details.jobDescription}</pre>
                                                ) : (
                                                    <p>No job description available.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target={`#${modalId}`}
                                    onClick={() => PlacementDetails(single_response)}
                                    style={{
                                        display: 'block',
                                        margin: '10px auto',
                                        padding: '10px 20px',
                                        fontSize: '16px',
                                    }}
                                >
                                    Opening {index + 1}
                                </button>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <p>No responses yet. Try trayan@thrivelia.com!</p>
                )}
            </div>
        </div>
    );
};

export default SearchBoxWithResponse;
