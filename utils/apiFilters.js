class ApiFilters {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        // Removing fields from the query
        const fieldsToRemove = ['sort', 'fields', 'q', 'limit', 'page'];
        fieldsToRemove.forEach(el => delete queryCopy[el]);
        // Advance filter using: lt, lte, gt, gte
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        // console.log(queryStr);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = (this.queryStr.sort).split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-postingDate');
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = (this.queryStr.fields).split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    searchByQuery() {
        if (this.queryStr.q) {
            const searchPhrase = (this.queryStr.q).split('-').join(' ');
            this.query = this.query.find({ $text: { $search: searchPhrase } });
        }
        return this;
    }

    pagination() {
        const page = Number.parseInt(this.queryStr.page, 10) || 1;
        const limit = Number.parseInt(this.queryStr.limit, 10) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

export default ApiFilters;