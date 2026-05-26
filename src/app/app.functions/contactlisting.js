const axios = require("axios");

exports.main = async (context) => {
  const accessToken = process.env.contact_app;

  // 1. Grab parameters from the frontend URL query string
  const searchTerm = context.params.query ? context.params.query[0] : "";
  const limit =
    context.params.limit ? parseInt(context.params.limit[0], 10) : 5;
  const after = context.params.after ? context.params.after[0] : null;

  // 2. Build the HubSpot Search API payload
  const payload = {
    limit: limit,
    properties: ["firstname", "lastname", "email", "phone"],
  };

  // If the user typed a search term, add it to the query
  if (searchTerm) {
    payload.query = searchTerm;
  }

  // If we have a cursor for the next page, append it
  if (after && after !== "0") {
    payload.after = after;
  }

  try {
    const response = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    // 3. Return the array of contacts, the total count, and the pagination cursor
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "SUCCESS",
        results: response.data.results,
        total: response.data.total,
        paging: response.data.paging, // Contains the "next.after" token
      }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    return {
      statusCode: error.response?.status ?? 500,
      body: JSON.stringify({
        status: "ERROR",
        message: error.response?.data?.message ?? error.message,
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
