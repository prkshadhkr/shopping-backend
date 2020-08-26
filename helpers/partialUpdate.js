/** partial updates - generic function
 * generates a selective update query based on a request body.
 * 
 * -table: where to make the query
 * -item: an object with keys of columns you waant to update
 *  and values with updated values
 * -key: the column that we query by (e.g. username, product_name)
 * -id: current record ID
 * 
 * returns object containing a db query as a stirng and  array of
 * string values to be updated.
 */

function sqlPartialUpdate(table, items, key, id){

  //keep track of item index
  //store all the columns we want to update and associate with vals
  let idx = 1;
  let columns = [];

  // filter out keys that start with "_" -- we do't want thes in db

  for (let key in items){
    if (key.startsWith("_")) {
      delete items[key];
    }
  }
  for (let column in items){
    columns.push(`${column}=$${idx}`);
    idx += 1;
  }

  //build query
  let cols = columns.join(", ");
  let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING *`;
  let values = Object.values(items);
  values.push(id);
  return { query, values };
}

module.exports = sqlPartialUpdate;