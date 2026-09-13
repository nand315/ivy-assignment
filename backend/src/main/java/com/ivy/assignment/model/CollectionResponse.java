package com.ivy.assignment.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CollectionResponse<T> {
    @JsonProperty("limit")
    private Integer limit;

    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("count")
    private Integer count;

    @JsonProperty("total")
    private Integer total;

    @JsonProperty("has_more")
    private Boolean hasMore;

    @JsonProperty("results")
    private List<T> results;

    public CollectionResponse() {}

    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }

    public Integer getOffset() { return offset; }
    public void setOffset(Integer offset) { this.offset = offset; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public Boolean getHasMore() { return hasMore; }
    public void setHasMore(Boolean hasMore) { this.hasMore = hasMore; }

    public List<T> getResults() { return results; }
    public void setResults(List<T> results) { this.results = results; }
}
